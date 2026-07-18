import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Lazy initialization of Supabase client to avoid crashes if environment variables are missing on startup.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") {
    console.warn("[Supabase SDK] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Falling back to local storage backup.");
    return null;
  }

  try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log("[Supabase SDK] Supabase Client initialized successfully with URL:", supabaseUrl);
    return supabaseClientInstance;
  } catch (err: any) {
    console.error("[Supabase SDK] Failed to initialize Supabase client:", err.message);
    return null;
  }
}

/**
 * Slugify a string helper for subdomains and urls
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

/**
 * Parses the generated HTML code to extract details for the Supabase SaaS schema.
 */
function parseWebsiteHtml(html: string, prompt: string) {
  // 1. Extract Title
  let title = "Tranonkala vaovao";
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // 2. Extract SEO Description
  let description = `Mombamomba ny tranonkala: ${prompt.substring(0, 80)}...`;
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
                    html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
  if (descMatch && descMatch[1]) {
    description = descMatch[1].trim();
  }

  // 3. Extract Theme Color suggestions
  let primaryColor = "#0ea5e9"; // Default sky blue
  let secondaryColor = "#64748b"; // Default slate
  
  // Try to find custom classes or primary colors in tailwind colors if defined
  if (html.includes("bg-emerald-") || html.includes("text-emerald-")) {
    primaryColor = "#10b981";
  } else if (html.includes("bg-purple-") || html.includes("text-purple-")) {
    primaryColor = "#a855f7";
  } else if (html.includes("bg-amber-") || html.includes("text-amber-")) {
    primaryColor = "#f59e0b";
  } else if (html.includes("bg-rose-") || html.includes("text-rose-")) {
    primaryColor = "#f43f5e";
  } else if (html.includes("bg-indigo-") || html.includes("text-indigo-")) {
    primaryColor = "#6366f1";
  }

  // 4. Extract Images used
  const imageUrls: string[] = [];
  const imgRegex = /src=["'](https:\/\/images\.unsplash\.com\/photo-[^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (imageUrls.length < 5 && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }

  // Fallback if no images found
  if (imageUrls.length === 0) {
    imageUrls.push("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80");
  }

  // 5. Detect template type
  let template = "General Brochure";
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes("shop") || promptLower.includes("e-commerce") || promptLower.includes("vividy") || promptLower.includes("tsena")) {
    template = "E-Commerce Store";
  } else if (promptLower.includes("portfolio") || promptLower.includes("mombamomba ahy") || promptLower.includes("cv")) {
    template = "Personal Portfolio";
  } else if (promptLower.includes("restaurant") || promptLower.includes("sakafo") || promptLower.includes("gastro")) {
    template = "Restaurant Website";
  } else if (promptLower.includes("blog") || promptLower.includes("gazety") || promptLower.includes("vaovao")) {
    template = "Content Blog";
  } else if (promptLower.includes("hotel") || promptLower.includes("fizahan-tany") || promptLower.includes("fizahantany")) {
    template = "Booking/Tourism Portal";
  }

  return {
    title,
    description,
    primaryColor,
    secondaryColor,
    imageUrls,
    template
  };
}

/**
 * Automatically synchronization/seeding of a generated client website project to the Supabase single SaaS project.
 * Completely autonomous multi-tenant creation.
 */
export async function supabaseSyncNewProject(
  userId: string,
  userEmail: string,
  projectName: string,
  prompt: string,
  htmlCode: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Tsy misy SUPABASE_URL na SUPABASE_ANON_KEY voafaritra ao amin'ny lohamilina." };
  }

  try {
    console.log(`[Supabase Sync] Starting automated multi-tenant project creation for User: ${userId} (${userEmail})`);
    
    // Parse the generated HTML structure
    const parsedData = parseWebsiteHtml(htmlCode, prompt);
    const domain = `${slugify(projectName)}.com`;
    const subdomain = `${slugify(projectName)}-${Date.now().toString().slice(-4)}.devwebia.com`;

    // 1. Ensure user profile exists in Supabase profiles (failsafe insert)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: userEmail,
        display_name: userEmail.split("@")[0],
        credits: 15.0,
        tokens_used: 0
      });

    if (profileError) {
      console.warn("[Supabase Sync] Warning while ensuring profile exists (might be normal if RLS blocks or already exists):", profileError.message);
    }

    // 2. Create Project logically
    const { data: projectRow, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: projectName,
        prompt: prompt,
        status: "active"
      })
      .select()
      .single();

    if (projectError || !projectRow) {
      throw new Error(`Tsy nahomby ny famoronana 'projects' ao amin'ny Supabase: ${projectError?.message}`);
    }

    const projectId = projectRow.id;
    console.log(`[Supabase Sync] 1/10 - Logical project created with UUID: ${projectId}`);

    // 3. Create Website associated with project
    const { data: websiteRow, error: websiteError } = await supabase
      .from("websites")
      .insert({
        project_id: projectId,
        user_id: userId,
        domain: domain,
        subdomain: subdomain,
        template_chosen: parsedData.template,
        theme_config: {
          primaryColor: parsedData.primaryColor,
          secondaryColor: parsedData.secondaryColor,
          fontFamily: "Outfit, sans-serif"
        },
        status: "published"
      })
      .select()
      .single();

    if (websiteError || !websiteRow) {
      throw new Error(`Tsy nahomby ny famoronana 'websites' ao amin'ny Supabase: ${websiteError?.message}`);
    }

    const websiteId = websiteRow.id;
    console.log(`[Supabase Sync] 2/10 - Website configuration saved under ID: ${websiteId}`);

    // 4. Create Pages (Home page with the full generated HTML code)
    const { error: pageError } = await supabase
      .from("pages")
      .insert({
        website_id: websiteId,
        project_id: projectId,
        user_id: userId,
        title: "Fandraisana (Home)",
        slug: "home",
        html_content: htmlCode,
        is_published: true
      });

    if (pageError) {
      throw new Error(`Tsy nahomby ny famoronana 'pages' fandraisana ao amin'ny Supabase: ${pageError.message}`);
    }
    console.log(`[Supabase Sync] 3/10 - Home page content and compiled HTML code stored.`);

    // 5. Create Settings table entry
    const { error: settingsError } = await supabase
      .from("settings")
      .insert({
        website_id: websiteId,
        project_id: projectId,
        user_id: userId,
        layout_style: "modern",
        font_pair: "Outfit / Inter",
        primary_color: parsedData.primaryColor,
        secondary_color: parsedData.secondaryColor,
        footer_text: `© ${new Date().getFullYear()} ${projectName}. Zo rehetra voatokana. Crafted automatically by DevWebIA SaaS.`,
        social_links: {
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
          instagram: "https://instagram.com"
        }
      });

    if (settingsError) {
      console.error("[Supabase Sync] Warning creating settings row:", settingsError.message);
    } else {
      console.log("[Supabase Sync] 4/10 - Layout colors and social links configurations saved.");
    }

    // 6. Create SEO configuration row
    const { error: seoError } = await supabase
      .from("seo")
      .insert({
        website_id: websiteId,
        project_id: projectId,
        user_id: userId,
        meta_title: parsedData.title,
        meta_description: parsedData.description,
        meta_keywords: `${projectName}, website, dynamic app, artificial intelligence, devwebia`,
        og_image: parsedData.imageUrls[0] || null
      });

    if (seoError) {
      console.error("[Supabase Sync] Warning creating SEO row:", seoError.message);
    } else {
      console.log("[Supabase Sync] 5/10 - SEO Title, Meta Keywords, and OG preview image linked.");
    }

    // 7. Seed sample Blog posts
    const { error: blogError } = await supabase
      .from("blog_posts")
      .insert([
        {
          website_id: websiteId,
          project_id: projectId,
          user_id: userId,
          title: `Tongasoa eto amin'ny ${projectName}`,
          content: `Tena faly miarahaba anao izahay. Ity dia lahatsoratra voalohany amin'ny bilaogy novokarin'ny DEVWEB IA mivantana. Azonao ovaina ity pejy ity na ampiana lahatsoratra vaovao ao amin'ny dashboard-nao.`,
          excerpt: `Fampidirana kely momba ny tranonkala vaovao ary fitsidihana ny rafitra.`,
          cover_image: parsedData.imageUrls[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          status: "published"
        },
        {
          website_id: websiteId,
          project_id: projectId,
          user_id: userId,
          title: "Ny tombontsoa azo amin'ny tranonkala responsive",
          content: "Ny fahafahan'ny tranonkala iray mifanaraka amin'ny finday, tablette, ary solosaina dia manampy betsaka amin'ny fitomboan'ny mpanjifa sy ny varotra ataonao. Izany no nahatonga anay namolavola ity site ity ho responsive tanteraka.",
          excerpt: "Nahoana no tena ilaina amin'izao andro izao ny manana site responsive?",
          cover_image: parsedData.imageUrls[1] || parsedData.imageUrls[0] || "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=800&q=80",
          status: "published"
        }
      ]);

    if (blogError) {
      console.error("[Supabase Sync] Warning seeding blog posts:", blogError.message);
    } else {
      console.log("[Supabase Sync] 6/10 - Seeded multi-tenant sample blog posts into the client website database.");
    }

    // 8. Seed Media images reference
    const mediaRows = parsedData.imageUrls.map((url, idx) => ({
      website_id: websiteId,
      project_id: projectId,
      user_id: userId,
      url: url,
      title: `Sary mpanampy faha-${idx + 1}`,
      file_type: "image/jpeg"
    }));

    const { error: mediaError } = await supabase
      .from("media")
      .insert(mediaRows);

    if (mediaError) {
      console.error("[Supabase Sync] Warning seeding media library:", mediaError.message);
    } else {
      console.log(`[Supabase Sync] 7/10 - Linked ${parsedData.imageUrls.length} Unsplash images to client library.`);
    }

    // 9. Create a contact form submission sample setup
    const { error: formError } = await supabase
      .from("forms")
      .insert({
        website_id: websiteId,
        project_id: projectId,
        user_id: userId,
        form_name: "Contact Form Website",
        visitor_name: "Rakoto Ndriana",
        visitor_email: "rakoto@gmail.com",
        visitor_message: "Miarahaba, tena tsara sy kanto ny tranonkalanareo! Te-hizaha fiaraha-miasa akaiky aho.",
        payload: {
          subject: "Fiaraha-miasa",
          phone: "0340012345"
        }
      });

    if (formError) {
      console.error("[Supabase Sync] Warning creating sample forms submissions:", formError.message);
    } else {
      console.log("[Supabase Sync] 8/10 - Form submission tracker activated with first sample input.");
    }

    // 10. Seed first page views in analytics
    const { error: analyticsError } = await supabase
      .from("analytics")
      .insert({
        website_id: websiteId,
        project_id: projectId,
        user_id: userId,
        page_url: "/",
        referrer: "https://google.com",
        user_agent: "Mozilla/5.0 (SaaS Multi-tenant tracker)",
        visitor_ip_hash: "visitor_initial_launch_hash"
      });

    if (analyticsError) {
      console.error("[Supabase Sync] Warning seeding initial pageview analytics:", analyticsError.message);
    } else {
      console.log("[Supabase Sync] 9/10 - Page views monitoring initialized. SaaS visitor traffic live.");
    }

    console.log(`[Supabase Sync] 10/10 - SUCCESS! Project ${projectName} synchronized with multi-tenant SaaS schema.`);
    return { success: true, projectId };

  } catch (err: any) {
    console.error("[Supabase Sync] Error occurred during Supabase transaction:", err.message);
    return { success: false, error: err.message };
  }
}
