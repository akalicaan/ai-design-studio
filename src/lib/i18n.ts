export type Lang = "en" | "tr";

export const translations = {
  en: {
    // Navbar
    nav_tools: "Tools",
    nav_how_it_works: "How it works",
    nav_pricing: "Pricing",
    nav_workspace: "Workspace",
    nav_sign_in: "Sign in",
    nav_start_designing: "Start Designing",
    nav_exit: "Exit",
    nav_top_up: "Top up",

    // Hero
    hero_badge: "AI-powered production tools for designers",
    hero_title_1: "Turn messy artwork into",
    hero_title_2: "clean production files",
    hero_desc:
      "Extract artwork from mockups, auto-trace to SVG, remove backgrounds, and upscale to 4K. Built for print shops, apparel designers, and stock contributors.",
    hero_cta_primary: "Start designing",
    hero_cta_secondary: "View pricing",

    // Tools
    tools_title: "Production Tools",
    tools_subtitle: "Everything you need to prepare artwork for print and stock",
    tool_vectorize_title: "Vectorize",
    tool_vectorize_desc:
      "Auto-trace raster logos and artwork into clean, scalable SVG files. Standard and precision modes.",
    tool_vectorize_credit: "1 credit per standard trace",
    tool_bgremove_title: "BG Remove",
    tool_bgremove_desc:
      "AI-powered background removal for complex edges, hair, fur, and product photos.",
    tool_bgremove_credit: "1 credit per image",
    tool_upscale_title: "4K Upscale",
    tool_upscale_desc:
      "Enhance low-resolution designs to 4K quality. Recover details and sharpen edges for large format printing.",
    tool_upscale_credit: "2 credits per image",
    tool_pattern_title: "Pattern Extract",
    tool_pattern_desc:
      "Extract fabric patterns from apparel/mockup photos. Removes logos, text, fills empty areas. Creates seamless print-ready tiles.",
    tool_pattern_credit: "3 credits per extract",
    pattern_remove_logos: "Remove logos",
    pattern_remove_text: "Remove text/sponsors",
    pattern_fill_empty: "Fill empty areas",
    pattern_seamless: "Seamless tile",
    pattern_output_size: "Output size",
    pattern_dpi: "DPI",
    pattern_format: "Output format",
    pattern_size_180x100: "180cm x 100cm (Full)",
    pattern_size_90x50: "90cm x 50cm (Half)",
    pattern_format_png: "PNG (Raster)",
    pattern_format_svg: "SVG (Vector)",
    pattern_analyzing: "Analyzing pattern...",
    pattern_removing_logos: "Removing logos and text...",
    pattern_filling: "Filling empty areas...",
    pattern_seamless_gen: "Generating seamless tile...",
    pattern_upscaling: "Upscaling to print resolution...",
    tool_aipattern_title: "AI Pattern Generator",
    tool_aipattern_desc:
      "Describe your dream pattern and AI creates it instantly. Seamless, print-ready textile designs.",
    tool_aipattern_credit: "2 credits per generate",
    aipattern_prompt_label: "Describe your pattern",
    aipattern_prompt_placeholder: "e.g. seamless floral pattern featuring large, ruffled peony blossoms in soft blue and cream tones with gold accents",
    aipattern_style: "Style",
    aipattern_style_textile: "Textile",
    aipattern_style_floral: "Floral",
    aipattern_style_geometric: "Geometric",
    aipattern_style_abstract: "Abstract",
    aipattern_style_vintage: "Vintage",
    aipattern_colors: "Color scheme (optional)",
    aipattern_colors_placeholder: "e.g. navy blue, gold, cream",
    aipattern_generate: "Generate Pattern",
    aipattern_creating: "AI is designing your pattern...",
    aipattern_reference: "Reference Image (Optional)",
    aipattern_reference_upload: "Upload pattern reference",
    aipattern_prompt_hint: "Works in any language: English, Türkçe, العربية, 中文...",
    aipattern_error_empty: "Please enter a pattern description",
    aipattern_suggestions: "Quick Prompts",
    suggestion_floral: "Floral",
    suggestion_geometric: "Geometric",
    suggestion_abstract: "Abstract",
    suggestion_textile: "Textile",

    // How it works
    hiw_title: "How it works",
    hiw_subtitle: "From upload to production-ready file in 3 steps",
    hiw_step1_title: "Upload your source",
    hiw_step1_desc:
      "Start with a logo, mockup, product photo, or raster artwork. Supports PNG, JPG, JPEG, and WebP.",
    hiw_step2_title: "Pick the tool",
    hiw_step2_desc:
      "Choose vector tracing, background removal, image upscale, or mockup extraction. Adjust settings if needed.",
    hiw_step3_title: "Export ready files",
    hiw_step3_desc:
      "Download editable SVG, high-res PNG, transparent assets, or a ZIP package for print handoff.",

    // Trust
    trust_private: "100% Private",
    trust_private_sub: "Auto-deletes after 7 days",
    trust_fast: "Fast Processing",
    trust_fast_sub: "Results in seconds",
    trust_ready: "Production Ready",
    trust_ready_sub: "SVG + PNG + ZIP",
    trust_own: "You Own the Data",
    trust_own_sub: "No model training",

    // Footer
    footer_pricing: "Pricing",
    footer_workspace: "Workspace",

    // Pricing
    pricing_badge: "One-time packages. No subscription.",
    pricing_title: "Choose your package",
    pricing_subtitle: "Pick a credit package that fits your workflow. Credits never expire.",
    pricing_onetime: "one-time",
    pricing_credits: "credits",
    pricing_select: "Select",
    pricing_standard_trace: "Standard trace = 1 credit",
    pricing_precision_trace: "Precision trace = 2 credits",
    pricing_bgremove: "BG Remove = 1 credit",
    pricing_upscale: "4K Upscale = 2 credits",
    pricing_expire_note: "Credits never expire. Use them whenever you need.",
    pricing_dialog_title: "Complete Purchase",
    pricing_dialog_desc: "Review your selected package before confirming.",
    pricing_dialog_package: "Package",
    pricing_dialog_note:
      "MVP Note: Payment integration (Paddle / Lemon Squeezy / iyzico) will be connected here. For demo purposes, clicking Confirm will add credits to your account.",
    pricing_cancel: "Cancel",
    pricing_confirm: "Confirm Purchase",
    pricing_processing: "Processing...",

    // Workspace
    ws_select_tool: "Select Tool",
    ws_cost: "Cost per operation",
    ws_credit_singular: "credit",
    ws_credit_plural: "credits",
    ws_insufficient: "Insufficient",
    ws_get_credits: "Get more credits",
    ws_drop_here: "Drop your image here",
    ws_drop_sub: "or click to browse (PNG, JPG, WebP up to 10MB)",
    ws_select_file: "Select File",
    ws_original: "Original",
    ws_result: "Result",
    ws_processing: "AI processing...",
    ws_processing_wait: "This may take 10-30 seconds",
    ws_click_process: "Click Process to generate",
    ws_failed: "Processing failed",
    ws_process_with: "Process with",
    ws_download: "Download",
    ws_retry: "Retry",
    ws_recent_projects: "Recent Projects",
    ws_total: "total",
    ws_no_projects: "No projects yet. Upload an image to get started.",
    ws_precision_mode: "Precision mode",
    ws_precision_sub: "Better quality, uses 2 credits",
    ws_clear: "Clear",
    ws_settings: "Settings",
    ws_drag_drop: "Drop your image here",
    ws_formats: "PNG, JPG, WebP up to 10MB",
    ws_new_image: "New image",
    ws_replace: "Replace",
    ws_process: "Process",
    ws_waiting: "Waiting for process...",

    // Errors / Toast
    toast_signin_first: "Please sign in first to purchase credits.",
    toast_upload_image: "Please upload an image file (PNG, JPG, WebP)",
    toast_file_size: "File size must be less than 10MB",
    toast_success: "AI processing complete!",
    toast_demo_mode:
      "Project created! (Demo mode - AI token not configured)",

    // Lang toggle
    lang_en: "EN",
    lang_tr: "TR",

    // Theme toggle
    theme_light: "Light",
    theme_dark: "Dark",
  },

  tr: {
    // Navbar
    nav_tools: "Araçlar",
    nav_how_it_works: "Nasıl Çalışır",
    nav_pricing: "Fiyatlandırma",
    nav_workspace: "Çalışma Alanı",
    nav_sign_in: "Giriş Yap",
    nav_start_designing: "Tasarıma Başla",
    nav_exit: "Çıkış",
    nav_top_up: "Kredi Al",

    // Hero
    hero_badge: "Tasarımcılar için AI destekli üretim araçları",
    hero_title_1: "Dağınık tasarımları",
    hero_title_2: "temiz üretim dosyalarına dönüştürün",
    hero_desc:
      "Mockup'lardan tasarım çıkarın, otomatik SVG'ye çevirin, arka planları kaldırın ve 4K'ya yükseltin. Baskı atölyeleri, giyim tasarımcıları ve stok katkıda bulunanlar için.",
    hero_cta_primary: "Tasarıma Başla",
    hero_cta_secondary: "Fiyatları Gör",

    // Tools
    tools_title: "Üretim Araçları",
    tools_subtitle: "Baskı ve stok için tasarım hazırlamak için ihtiyacınız olan her şey",
    tool_vectorize_title: "Vektörize Et",
    tool_vectorize_desc:
      "Raster logoları ve tasarımları temiz, ölçeklenebilir SVG dosyalarına otomatik çevirin. Standart ve hassas modlar.",
    tool_vectorize_credit: "Standart iz için 1 kredi",
    tool_bgremove_title: "Arka Plan Kaldır",
    tool_bgremove_desc:
      "Karmaşık kenarlar, saç, kürk ve ürün fotoğrafları için AI destekli arka plan kaldırma.",
    tool_bgremove_credit: "Resim başına 1 kredi",
    tool_upscale_title: "4K Yükselt",
    tool_upscale_desc:
      "Düşük çözünürlüklü tasarımları 4K kalitesine yükseltin. Büyük format baskı için detayları kurtarın.",
    tool_upscale_credit: "Resim başına 2 kredi",
    tool_pattern_title: "Desen Çıkar",
    tool_pattern_desc:
      "Giyim/mockup fotoğraflarından kumaş desenini çıkar. Logoları, yazıları kaldırır, boş alanları doldurur. Dikişsiz baskıya hazır tile oluşturur.",
    tool_pattern_credit: "Çıkarma başına 3 kredi",
    pattern_remove_logos: "Logoları kaldır",
    pattern_remove_text: "Yazı/sponsorları kaldır",
    pattern_fill_empty: "Boş alanları doldur",
    pattern_seamless: "Dikişsiz tile",
    pattern_output_size: "Çıktı boyutu",
    pattern_dpi: "DPI",
    pattern_format: "Çıktı formatı",
    pattern_size_180x100: "180cm x 100cm (Tam)",
    pattern_size_90x50: "90cm x 50cm (Yarım)",
    pattern_format_png: "PNG (Raster)",
    pattern_format_svg: "SVG (Vektör)",
    pattern_analyzing: "Desen analiz ediliyor...",
    pattern_removing_logos: "Logolar ve yazılar kaldırılıyor...",
    pattern_filling: "Boş alanlar dolduruluyor...",
    pattern_seamless_gen: "Dikişsiz tile oluşturuluyor...",
    pattern_upscaling: "Baskı çözünürlüğüne yükseltiliyor...",
    tool_aipattern_title: "AI Desen Oluştur",
    tool_aipattern_desc:
      "Hayalindeki deseni tarif et, AI anında oluştursun. Dikişsiz, baskıya hazır tekstil tasarımları.",
    tool_aipattern_credit: "Oluşturma başına 2 kredi",
    aipattern_prompt_label: "Desenini tarif et",
    aipattern_prompt_placeholder: "örn. yumuşak mavi ve krem tonlarında altın detaylı büyük, fırfırlı şakayık çiçekleri içeren dikişsiz çiçekli desen",
    aipattern_style: "Stil",
    aipattern_style_textile: "Tekstil",
    aipattern_style_floral: "Çiçekli",
    aipattern_style_geometric: "Geometrik",
    aipattern_style_abstract: "Soyut",
    aipattern_style_vintage: "Vintage",
    aipattern_colors: "Renk şeması (isteğe bağlı)",
    aipattern_colors_placeholder: "örn. lacivert, altın, krem",
    aipattern_generate: "Desen Oluştur",
    aipattern_creating: "AI deseninizi tasarlıyor...",
    aipattern_reference: "Referans Resim (Opsiyonel)",
    aipattern_reference_upload: "Desen referansı yükleyin",
    aipattern_prompt_hint: "Her dilde yazabilirsiniz: Türkçe, English, العربية, 中文...",
    aipattern_error_empty: "Lütfen bir desen açıklaması girin",
    aipattern_suggestions: "Hazır Promptlar",
    suggestion_floral: "Çiçekli",
    suggestion_geometric: "Geometrik",
    suggestion_abstract: "Soyut",
    suggestion_textile: "Tekstil",

    // How it works
    hiw_title: "Nasıl Çalışır",
    hiw_subtitle: "Yüklemekten üretim hazır dosyaya 3 adımda",
    hiw_step1_title: "Kaynağınızı yükleyin",
    hiw_step1_desc:
      "Logo, mockup, ürün fotoğrafı veya raster tasarımla başlayın. PNG, JPG, JPEG ve WebP desteklenir.",
    hiw_step2_title: "Aracı seçin",
    hiw_step2_desc:
      "Vektör izleme, arka plan kaldırma, resim yükseltme veya mockup çıkarma seçin. Gerekirse ayarları düzenleyin.",
    hiw_step3_title: "Hazır dosyaları dışa aktarın",
    hiw_step3_desc:
      "Düzenlenebilir SVG, yüksek çözünürlüklü PNG, şeffaf varlıklar veya baskı teslimi için ZIP paketi indirin.",

    // Trust
    trust_private: "%100 Gizli",
    trust_private_sub: "7 gün sonra otomatik silinir",
    trust_fast: "Hızlı İşlem",
    trust_fast_sub: "Saniyeler içinde sonuç",
    trust_ready: "Üretime Hazır",
    trust_ready_sub: "SVG + PNG + ZIP",
    trust_own: "Veri Sizindir",
    trust_own_sub: "Model eğitimi yok",

    // Footer
    footer_pricing: "Fiyatlandırma",
    footer_workspace: "Çalışma Alanı",

    // Pricing
    pricing_badge: "Tek seferlik paketler. Abonelik yok.",
    pricing_title: "Paketinizi Seçin",
    pricing_subtitle: "İş akışınıza uygun bir kredi paketi seçin. Kredilerin süresi dolmaz.",
    pricing_onetime: "tek seferlik",
    pricing_credits: "kredi",
    pricing_select: "Seç",
    pricing_standard_trace: "Standart iz = 1 kredi",
    pricing_precision_trace: "Hassas iz = 2 kredi",
    pricing_bgremove: "Arka Plan Kaldır = 1 kredi",
    pricing_upscale: "4K Yükselt = 2 kredi",
    pricing_expire_note: "Kredilerin süresi dolmaz. İstediğiniz zaman kullanın.",
    pricing_dialog_title: "Satın Almayı Tamamla",
    pricing_dialog_desc: "Onaylamadan önce seçtiğiniz paketi gözden geçirin.",
    pricing_dialog_package: "Paket",
    pricing_dialog_note:
      "MVP Notu: Ödeme entegrasyonu (Paddle / Lemon Squeezy / iyzico) buraya bağlanacak. Demo amacıyla, Onayla'ya tıklamak hesabınıza kredi ekler.",
    pricing_cancel: "İptal",
    pricing_confirm: "Satın Almayı Onayla",
    pricing_processing: "İşleniyor...",

    // Workspace
    ws_select_tool: "Araç Seç",
    ws_cost: "İşlem başına maliyet",
    ws_credit_singular: "kredi",
    ws_credit_plural: "kredi",
    ws_insufficient: "Yetersiz",
    ws_get_credits: "Daha fazla kredi al",
    ws_drop_here: "Resminizi buraya bırakın",
    ws_drop_sub: "veya göz atmak için tıklayın (PNG, JPG, WebP, max 10MB)",
    ws_select_file: "Dosya Seç",
    ws_original: "Orijinal",
    ws_result: "Sonuç",
    ws_processing: "AI işleniyor...",
    ws_processing_wait: "Bu 10-30 saniye sürebilir",
    ws_click_process: "Oluşturmak için İşle'e tıklayın",
    ws_failed: "İşlem başarısız",
    ws_process_with: "ile İşle",
    ws_download: "İndir",
    ws_retry: "Tekrar Dene",
    ws_recent_projects: "Son Projeler",
    ws_total: "toplam",
    ws_no_projects: "Henüz proje yok. Başlamak için bir resim yükleyin.",
    ws_precision_mode: "Hassas mod",
    ws_precision_sub: "Daha iyi kalite, 2 kredi kullanır",
    ws_clear: "Temizle",
    ws_settings: "Ayarlar",
    ws_drag_drop: "Resminizi buraya bırakın",
    ws_formats: "PNG, JPG, WebP max 10MB",
    ws_new_image: "Yeni resim",
    ws_replace: "Değiştir",
    ws_process: "İşle",
    ws_waiting: "İşlem bekleniyor...",

    // Errors / Toast
    toast_signin_first: "Kredi satın almak için önce giriş yapın.",
    toast_upload_image: "Lütfen bir resim dosyası yükleyin (PNG, JPG, WebP)",
    toast_file_size: "Dosya boyutu 10MB'dan az olmalıdır",
    toast_success: "AI işlemi tamamlandı!",
    toast_demo_mode:
      "Proje oluşturuldu! (Demo modu - AI token yapılandırılmamış)",

    // Lang toggle
    lang_en: "EN",
    lang_tr: "TR",

    // Theme toggle
    theme_light: "Aydınlık",
    theme_dark: "Karanlık",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(key: TranslationKey, lang: Lang): string {
  return translations[lang][key] ?? key;
}
