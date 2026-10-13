import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Layers,
  Scissors,
  Image,
  ZoomIn,
  Upload,
  Download,
  Coins,
  ArrowLeft,
  Loader2,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Palette,
  Sparkles,
} from "lucide-react";

type ToolType = "vectorize" | "bg_remove" | "upscale" | "pattern_extract" | "pattern_generate";

export default function Workspace() {
  const { user } = useAuth();
  const { _ } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: balance, refetch: refetchBalance } = trpc.credit.balance.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { refetch: refetchProjects } = trpc.project.list.useQuery(
    undefined,
    { enabled: !!user }
  );
  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      refetchProjects();
      refetchBalance();
    },
  });
  const patternExtract = trpc.pattern.extract.useMutation();
  const patternGenerate = trpc.pattern.generate.useMutation();

  const [selectedTool, setSelectedTool] = useState<ToolType>("pattern_generate");
  const [precision, setPrecision] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"idle" | "success" | "error">("idle");
  const [resultError, setResultError] = useState<string | null>(null);

  // Pattern extract settings
  const [removeLogos, setRemoveLogos] = useState(true);
  const [removeText, setRemoveText] = useState(true);
  const [fillEmpty, setFillEmpty] = useState(true);
  const [makeSeamless, setMakeSeamless] = useState(true);
  const [outputSize, setOutputSize] = useState<"180x100" | "90x50">("180x100");
  const [outputFormat, setOutputFormat] = useState<"png" | "svg">("png");

  // AI Pattern Generator settings
  const [prompt, setPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState<"textile" | "floral" | "geometric" | "abstract" | "vintage">("textile");
  const [colorScheme, setColorScheme] = useState("");

  const currentCost =
    selectedTool === "vectorize"
      ? precision
        ? 2
        : 1
      : selectedTool === "upscale"
      ? 2
      : selectedTool === "pattern_extract"
      ? 3
      : selectedTool === "pattern_generate"
      ? 2
      : 1;
  const hasEnoughCredits = (balance?.balance ?? 0) >= currentCost;

  const toolLabels: Record<ToolType, string> = {
    vectorize: _("tool_vectorize_title"),
    bg_remove: _("tool_bgremove_title"),
    upscale: _("tool_upscale_title"),
    pattern_extract: _("tool_pattern_title"),
    pattern_generate: _("tool_aipattern_title"),
  };

  const toolSubtitles: Record<ToolType, string> = {
    vectorize: _("tool_vectorize_credit"),
    bg_remove: _("tool_bgremove_credit"),
    upscale: _("tool_upscale_credit"),
    pattern_extract: _("tool_pattern_credit"),
    pattern_generate: _("tool_aipattern_credit"),
  };

  const toolIcons: Record<ToolType, typeof Scissors> = {
    vectorize: Scissors,
    bg_remove: Image,
    upscale: ZoomIn,
    pattern_extract: Palette,
    pattern_generate: Sparkles,
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(_("toast_upload_image"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(_("toast_file_size"));
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setOriginalFile(file);
      setResultUrl(null);
      setResultStatus("idle");
      setResultError(null);
    },
    [_]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (!hasEnoughCredits) {
      toast.error(`${_("ws_insufficient")}: ${currentCost} ${_("ws_credit_plural")}`);
      return;
    }

    setProcessing(true);
    setResultStatus("idle");
    setResultError(null);

    try {
      if (selectedTool === "pattern_generate") {
        if (!prompt.trim()) {
          toast.error("Please enter a pattern description");
          setProcessing(false);
          return;
        }
        const res = await patternGenerate.mutateAsync({
          prompt: prompt.trim(),
          style: aiStyle,
          colorScheme: colorScheme.trim() || undefined,
          makeSeamless: true,
          outputSize: "2048x2048",
        });

        if (res.success && res.imageUrl) {
          setResultUrl(res.imageUrl);
          setResultStatus("success");
          toast.success("Pattern generated successfully!");
        } else {
          throw new Error("Pattern generation failed");
        }
      } else if (selectedTool === "pattern_extract") {
        if (!previewUrl || !originalFile) {
          toast.error(_("toast_upload_image"));
          setProcessing(false);
          return;
        }
        const base64Url = await readFileAsBase64(originalFile);
        const res = await patternExtract.mutateAsync({
          imageBase64: base64Url,
          removeLogos,
          removeText,
          fillEmptyAreas: fillEmpty,
          makeSeamless,
          outputSize,
          dpi: 300,
          outputFormat,
        });

        if (res.success) {
          setResultStatus("success");
          setResultUrl(previewUrl);
          toast.success(
            `${_("tool_pattern_title")}: ${res.outputSpecs.dimensions}, ${res.outputSpecs.dpi} DPI, ${res.outputSpecs.format.toUpperCase()}`
          );
        } else {
          throw new Error("Pattern extraction failed");
        }
      } else {
        if (!previewUrl || !originalFile) {
          toast.error(_("toast_upload_image"));
          setProcessing(false);
          return;
        }
        const base64Url = await readFileAsBase64(originalFile);
        const res = await createProject.mutateAsync({
          toolType: selectedTool,
          precision: selectedTool === "vectorize" ? precision : false,
          inputUrl: base64Url,
          name: `${toolLabels[selectedTool]} - ${originalFile.name}`,
        });

        if (res.success && res.outputUrl) {
          setResultUrl(res.outputUrl);
          setResultStatus("success");
          toast.success(_("toast_success"));
        } else if (res.error) {
          setResultStatus("error");
          setResultError(res.error);
          toast.error(res.error);
        } else {
          setResultStatus("success");
          toast.success(_("toast_demo_mode"));
        }
      }
    } catch (e: any) {
      setResultStatus("error");
      const msg = e?.message ?? "Processing failed";
      setResultError(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const clearAll = () => {
    setPreviewUrl(null);
    setOriginalFile(null);
    setResultUrl(null);
    setResultStatus("idle");
    setResultError(null);
    setPrompt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const ActiveIcon = toolIcons[selectedTool];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md fixed top-0 w-full z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Layers className="w-6 h-6 text-primary" />
            <span>AI Design Studio</span>
          </Link>
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            {user && balance !== undefined && (
              <Badge
                variant={balance.balance < 1 ? "destructive" : "secondary"}
                className="gap-1.5 ml-2"
              >
                <Coins className="w-3.5 h-3.5" />
                {balance.balance} {_("pricing_credits")}
              </Badge>
            )}
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="gap-1.5 ml-2">
                <Coins className="w-3.5 h-3.5" /> {_("nav_top_up")}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> {_("nav_exit")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Tools */}
        <aside className="w-80 border-r border-border/40 bg-muted/20 p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
            {_("ws_select_tool")}
          </h2>

          {/* AI Pattern Generator - Featured */}
          <button
            onClick={() => {
              setSelectedTool("pattern_generate");
              setResultUrl(null);
              setResultStatus("idle");
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              selectedTool === "pattern_generate"
                ? "bg-primary/10 border-2 border-primary/40 shadow-sm"
                : "hover:bg-muted/50 border-2 border-transparent"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedTool === "pattern_generate"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">{_("tool_aipattern_title")}</div>
              <div className="text-xs text-muted-foreground">{_("tool_aipattern_credit")}</div>
            </div>
          </button>

          <Separator className="my-1" />

          {/* Pattern Extract */}
          <button
            onClick={() => {
              setSelectedTool("pattern_extract");
              setResultUrl(null);
              setResultStatus("idle");
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              selectedTool === "pattern_extract"
                ? "bg-primary/10 border-2 border-primary/40 shadow-sm"
                : "hover:bg-muted/50 border-2 border-transparent"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedTool === "pattern_extract"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">{_("tool_pattern_title")}</div>
              <div className="text-xs text-muted-foreground">{_("tool_pattern_credit")}</div>
            </div>
          </button>

          <Separator className="my-1" />

          {(["vectorize", "bg_remove", "upscale"] as ToolType[]).map((tool) => {
            const Icon = toolIcons[tool];
            const isActive = selectedTool === tool;
            return (
              <button
                key={tool}
                onClick={() => {
                  setSelectedTool(tool);
                  setResultUrl(null);
                  setResultStatus("idle");
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary/40 shadow-sm"
                    : "hover:bg-muted/50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{toolLabels[tool]}</div>
                  <div className="text-xs text-muted-foreground">{toolSubtitles[tool]}</div>
                </div>
              </button>
            );
          })}

          {/* AI Pattern Generator Settings */}
          {selectedTool === "pattern_generate" && (
            <div className="mt-1 space-y-3 p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {_("ws_settings")}
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">{_("aipattern_prompt_label")}</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={_("aipattern_prompt_placeholder")}
                  className="w-full h-24 px-3 py-2 text-sm rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">{_("aipattern_style")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["textile", "floral", "geometric", "abstract", "vintage"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={aiStyle === s ? "default" : "outline"}
                      className="text-xs h-7 capitalize"
                      onClick={() => setAiStyle(s)}
                    >
                      {s === "textile" && _("aipattern_style_textile")}
                      {s === "floral" && _("aipattern_style_floral")}
                      {s === "geometric" && _("aipattern_style_geometric")}
                      {s === "abstract" && _("aipattern_style_abstract")}
                      {s === "vintage" && _("aipattern_style_vintage")}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">{_("aipattern_colors")}</label>
                <input
                  type="text"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  placeholder={_("aipattern_colors_placeholder")}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Pattern Extract Settings */}
          {selectedTool === "pattern_extract" && (
            <div className="mt-1 space-y-3 p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {_("ws_settings")}
              </div>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" checked={removeLogos} onChange={(e) => setRemoveLogos(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <span>{_("pattern_remove_logos")}</span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" checked={removeText} onChange={(e) => setRemoveText(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <span>{_("pattern_remove_text")}</span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" checked={fillEmpty} onChange={(e) => setFillEmpty(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <span>{_("pattern_fill_empty")}</span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" checked={makeSeamless} onChange={(e) => setMakeSeamless(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <span>{_("pattern_seamless")}</span>
              </label>

              <Separator className="my-1" />

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">{_("pattern_output_size")}</label>
                <div className="flex gap-2">
                  <Button size="sm" variant={outputSize === "180x100" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setOutputSize("180x100")}>
                    {_("pattern_size_180x100")}
                  </Button>
                  <Button size="sm" variant={outputSize === "90x50" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setOutputSize("90x50")}>
                    {_("pattern_size_90x50")}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">{_("pattern_format")}</label>
                <div className="flex gap-2">
                  <Button size="sm" variant={outputFormat === "png" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setOutputFormat("png")}>
                    {_("pattern_format_png")}
                  </Button>
                  <Button size="sm" variant={outputFormat === "svg" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setOutputFormat("svg")}>
                    {_("pattern_format_svg")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedTool === "vectorize" && (
            <div className="mt-1 p-3 rounded-xl bg-muted/40 border border-border/30">
              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={precision}
                    onChange={(e) => setPrecision(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <div>
                  <div className="font-medium">{_("ws_precision_mode")}</div>
                  <div className="text-xs text-muted-foreground">{_("ws_precision_sub")}</div>
                </div>
              </label>
            </div>
          )}

          <Separator className="my-2" />

          <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">{_("ws_cost")}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Coins className="w-3 h-3" />
                {currentCost} {currentCost > 1 ? _("ws_credit_plural") : _("ws_credit_singular")}
              </Badge>
              {!hasEnoughCredits && (
                <span className="text-[10px] text-destructive font-medium">
                  {_("ws_insufficient")}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Link to="/pricing" className="block">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Coins className="w-4 h-4" /> {_("ws_get_credits")}
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTool === "pattern_generate" ? (
              /* AI Pattern Generator - Prompt based, no upload needed */
              <div className="h-full flex flex-col gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                  {/* Prompt Preview */}
                  <Card className="overflow-hidden flex flex-col">
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {_("aipattern_prompt_label")}
                        </span>
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-lg p-4 overflow-auto">
                        {prompt ? (
                          <div className="space-y-3">
                            <p className="text-sm text-foreground italic">&ldquo;{prompt}&rdquo;</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{aiStyle}</Badge>
                              {colorScheme && <Badge variant="outline">{colorScheme}</Badge>}
                              <Badge variant="outline">2048x2048</Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <Sparkles className="w-8 h-8" />
                            <p className="text-sm text-center">{_("aipattern_prompt_placeholder")}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Result */}
                  <Card className="overflow-hidden flex flex-col">
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {_("ws_result")}
                        </span>
                        {resultStatus === "success" && resultUrl && (
                          <a href={resultUrl} download target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                              <Download className="w-3.5 h-3.5" /> {_("ws_download")}
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {processing ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">{_("aipattern_creating")}</p>
                          </div>
                        ) : resultStatus === "error" ? (
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="w-8 h-8" />
                            <p className="text-sm text-center max-w-[200px]">{resultError}</p>
                          </div>
                        ) : resultUrl ? (
                          <img
                            src={resultUrl}
                            alt="Generated Pattern"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Sparkles className="w-8 h-8" />
                            <p className="text-sm">{_("ws_waiting")}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-end gap-3 shrink-0">
                  <Button variant="outline" size="sm" className="gap-2" onClick={clearAll}>
                    <RefreshCw className="w-4 h-4" /> {_("ws_new_image")}
                  </Button>
                  <Button
                    size="default"
                    className="gap-2 min-w-[180px]"
                    disabled={processing || !hasEnoughCredits || !prompt.trim()}
                    onClick={handleProcess}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {_("aipattern_creating")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {_("aipattern_generate")} ({currentCost})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : !previewUrl ? (
              /* Upload area for image-based tools */
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-5 transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/50 bg-muted/20"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">{_("ws_drag_drop")}</p>
                  <p className="text-xs text-muted-foreground">{_("ws_formats")}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" /> {_("ws_select_file")}
                </Button>
              </div>
            ) : (
              /* Image-based tool workspace */
              <div className="h-full flex flex-col gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                  {/* Original */}
                  <Card className="overflow-hidden flex flex-col">
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {_("ws_original")}
                        </span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={clearAll}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Original"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Result */}
                  <Card className="overflow-hidden flex flex-col">
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {_("ws_result")}
                        </span>
                        {resultStatus === "success" && resultUrl && (
                          <a href={resultUrl} download target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                              <Download className="w-3.5 h-3.5" /> {_("ws_download")}
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {processing ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">{_("ws_processing")}</p>
                          </div>
                        ) : resultStatus === "error" ? (
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="w-8 h-8" />
                            <p className="text-sm text-center max-w-[200px]">{resultError}</p>
                          </div>
                        ) : resultUrl ? (
                          <img
                            src={resultUrl}
                            alt="Result"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ActiveIcon className="w-8 h-8" />
                            <p className="text-sm">{_("ws_waiting")}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={clearAll}>
                      <RefreshCw className="w-4 h-4" /> {_("ws_new_image")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" /> {_("ws_replace")}
                    </Button>
                  </div>
                  <Button
                    size="default"
                    className="gap-2 min-w-[140px]"
                    disabled={processing || !hasEnoughCredits}
                    onClick={handleProcess}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {_("ws_processing")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {_("ws_process")} ({currentCost})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
