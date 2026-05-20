<?php
class Database {
    private static ?Database $instance = null;
    private PDO $pdo;

    private function __construct() {
        $cfgFile = __DIR__ . '/db_config.php';
        $useMySQL = false;

        if (file_exists($cfgFile)) {
            $cfg = require $cfgFile;
            // Only use MySQL if real credentials are filled in
            if (
                !empty($cfg['host']) &&
                !empty($cfg['password']) &&
                strpos($cfg['username'], 'XXXXXXX') === false &&
                $cfg['password'] !== 'YOUR_DB_PASSWORD'
            ) {
                $useMySQL = true;
            }
        }

        if ($useMySQL) {
            $this->pdo = new PDO(
                "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset=utf8mb4",
                $cfg['username'],
                $cfg['password'],
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } else {
            // Local development: use SQLite
            $dbPath = __DIR__ . '/../database/xcomify.db';
            $this->pdo = new PDO('sqlite:' . $dbPath, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $this->pdo->exec('PRAGMA foreign_keys = ON;');
        }

        $this->initSchema($useMySQL);
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->pdo;
    }

    private function initSchema(bool $mysql): void {
        if ($mysql) {
            $this->initMySQL();
        } else {
            $this->initSQLite();
        }

        // Seed default admin
        $count = (int)$this->pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        if ($count === 0) {
            $this->pdo->prepare(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
            )->execute(['Admin', 'admin@xcomify.com', password_hash('admin123', PASSWORD_BCRYPT), 'admin']);
        }

        $this->seedMockData();
    }

    private function seedMockData(): void {
        // Services
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM services')->fetchColumn() === 0) {
            $services = [
                ['Amazon FBA Management', 'amazon-fba-management', 'ShoppingCart', 'End-to-end Amazon FBA management to maximize your sales and profitability.', 'We handle everything from product listing optimization and inventory management to sponsored ads and brand protection on Amazon.', 'Product Listing Optimization,FBA Inventory Management,Sponsored Ads (PPC),Brand Registry & Protection,A+ Content Creation', '#FF6B35', 1],
                ['Amazon PPC Management', 'amazon-ppc-management', 'Target', 'Data-driven PPC campaigns that reduce ACoS and maximize ROI.', 'Our PPC specialists build and optimize campaigns that convert. We target the right keywords at the right bids to grow your Amazon business profitably.', 'Sponsored Product Campaigns,Sponsored Brand Campaigns,Keyword Research & Bidding,ACoS Optimization,Weekly Performance Reports', '#00D4FF', 2],
                ['Shopify Store Development', 'shopify-store-development', 'Globe', 'High-converting Shopify stores built for growth and scale.', 'From custom theme development to full store builds, we create Shopify stores that convert visitors into buyers with exceptional UX.', 'Custom Theme Development,Conversion Rate Optimization,App Integration,Speed Optimization,Mobile-First Design', '#7C3AED', 3],
                ['Etsy Shop Management', 'etsy-shop-management', 'Star', 'Grow your Etsy shop with expert SEO and marketing strategies.', 'We optimize your Etsy listings, manage your shop branding, and implement SEO strategies that consistently rank your products in top search results.', 'Etsy SEO & Keyword Optimization,Shop Branding & Design,Product Photography Tips,Listing Copywriting,Competitor Analysis', '#F59E0B', 4],
                ['TikTok Shop Setup', 'tiktok-shop-setup', 'Play', 'Launch and scale on the fastest-growing eCommerce platform.', 'We set up and manage your TikTok Shop from scratch — product catalogues, creator partnerships, live selling strategy, and ad campaigns.', 'TikTok Shop Account Setup,Creator & Affiliate Outreach,Live Selling Strategy,TikTok Ads Management,Viral Content Strategy', '#EC4899', 5],
                ['Product Research & Hunting', 'product-research-hunting', 'Search', 'Data-backed product hunting to find your next winning product.', 'Using advanced tools and market analysis, we identify high-demand, low-competition products with strong profit margins for Amazon, Etsy, or Shopify.', 'Market & Competition Analysis,Profit Margin Calculation,Trend & Demand Research,Supplier Sourcing,Private Label Opportunities', '#10B981', 6],
            ];
            $stmt = $this->pdo->prepare('INSERT INTO services (title, slug, icon, short_desc, description, features, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)');
            foreach ($services as $s) { $stmt->execute($s); }
        }

        // Portfolio
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM portfolio')->fetchColumn() === 0) {
            $portfolio = [
                ['NatureBloom Organics', 'Amazon', 'Stagnant sales, poor listing quality, high ACoS of 42%', 'Complete listing overhaul with A+ content, PPC restructure with tiered bidding strategy', 'ACoS reduced to 16%, revenue grew 340% in 6 months', '{"revenue": "+340%", "acos": "16%", "timeline": "6 months"}', 'Amazon,PPC,FBA', '#00D4FF', 1],
                ['CraftHaven Studio', 'Etsy', 'New shop with zero sales and no organic visibility', 'Full Etsy SEO audit, keyword-rich listing rewrites, shop branding refresh', 'Reached 500+ monthly sales within 4 months, Top 1% seller badge', '{"sales": "500+/month", "ranking": "Top 1%", "timeline": "4 months"}', 'Etsy,SEO,Branding', '#7C3AED', 1],
                ['UrbanPulse Apparel', 'Shopify', '0.8% conversion rate, high cart abandonment, slow site speed', 'Custom theme redesign, checkout optimization, page speed improvements', 'CVR jumped to 4.2%, revenue increased $180K in 90 days', '{"cvr": "4.2%", "revenue": "+$180K", "timeline": "90 days"}', 'Shopify,CRO,Development', '#FF6B35', 1],
                ['TechGadgets Pro', 'TikTok Shop', 'New to TikTok with no presence or creator network', 'Built creator affiliate program, ran targeted TikTok ads, optimized product pages', 'Hit $1M+ revenue in first 90 days, 2.3M total views', '{"revenue": "$1M+", "views": "2.3M", "timeline": "90 days"}', 'TikTok,Ads,Creator Marketing', '#EC4899', 1],
                ['PureWellness Co.', 'Amazon', 'Launching new supplement line with no brand recognition', 'Full product launch strategy: keyword research, PPC ramp-up, review generation', '500+ reviews in 60 days, reached Best Seller badge in category', '{"reviews": "500+", "rank": "Best Seller", "timeline": "60 days"}', 'Amazon,Launch,Brand Building', '#10B981', 0],
                ['HomeDecor Luxe', 'Multiple', 'Fragmented multi-channel presence with inconsistent branding', 'Unified brand identity, synchronized inventory across Amazon + Etsy + Shopify', '200% overall revenue growth, 95% reduction in overselling errors', '{"growth": "+200%", "error_reduction": "95%", "channels": "3"}', 'Multi-Channel,Amazon,Etsy,Shopify', '#F59E0B', 0],
            ];
            $stmt = $this->pdo->prepare('INSERT INTO portfolio (title, category, challenge, solution, result, metrics, tags, color, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
            foreach ($portfolio as $p) { $stmt->execute($p); }
        }

        // Testimonials
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM testimonials')->fetchColumn() === 0) {
            $testimonials = [
                ['Sarah Mitchell', 'NatureBloom Organics', 'Founder & CEO', 'xComify completely transformed our Amazon business. In just 6 months, our revenue grew by 340% and our ACoS dropped from 42% to 16%. Their PPC expertise is unmatched. Best investment we ever made!', 5, 'Amazon', '+$240K Revenue', 1],
                ['James Okonkwo', 'TechGadgets Pro', 'E-commerce Director', 'We hit $1M in our first 90 days on TikTok Shop — something we thought was impossible as a new brand. The xComify team built our entire creator network and ad strategy. Absolutely phenomenal results.', 5, 'TikTok Shop', '$1M in 90 days', 1],
                ['Emma Rodriguez', 'UrbanPulse Apparel', 'Marketing Manager', 'Our Shopify store was leaking money with a 0.8% CVR. After xComify redesigned and optimized everything, we hit 4.2%. That single change added $180K to our bottom line in three months.', 5, 'Shopify', '+$180K in 90 days', 1],
                ['David Chen', 'CraftHaven Studio', 'Etsy Seller', 'I was barely getting 10 sales a month on Etsy. Within 4 months of working with xComify, I hit 500+ monthly sales. Their SEO knowledge for Etsy is genuinely next-level. I wish I had found them sooner.', 5, 'Etsy', '500+ monthly sales', 1],
                ['Aisha Patel', 'PureWellness Co.', 'Founder', 'Launching on Amazon felt overwhelming until xComify took over. They got us 500 reviews in 60 days and a Best Seller badge. Our launch was smoother than I ever imagined possible.', 5, 'Amazon', 'Best Seller in 60 days', 1],
                ['Marcus Thompson', 'HomeDecor Luxe', 'Operations Lead', 'Managing three platforms at once was chaos. xComify built us a unified system and grew our total revenue by 200%. We went from constantly overselling to running like a machine.', 5, 'Multi-Channel', '+200% Revenue', 1],
            ];
            $stmt = $this->pdo->prepare('INSERT INTO testimonials (name, company, role, content, rating, platform, revenue, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)');
            foreach ($testimonials as $t) { $stmt->execute($t); }
        }

        // Blog posts
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM blogs')->fetchColumn() === 0) {
            $blogs = [
                ['How to Reduce Amazon ACoS Below 20% in 30 Days', 'how-to-reduce-amazon-acos-below-20', 'A step-by-step breakdown of the PPC optimization strategies we use to consistently drive ACoS under 20% for our Amazon clients.', 'High ACoS is the #1 problem we hear from Amazon sellers. In this post we break down the exact five-step framework our PPC team uses to systematically reduce advertising cost of sale without sacrificing top-line revenue...', 'Amazon PPC', 'xComify Team', 'Amazon,PPC,Advertising', 'published', 142],
                ['The Complete Guide to Etsy SEO in 2024', 'complete-guide-etsy-seo-2024', 'Everything you need to know about Etsy SEO — from keyword research to tag optimization — to rank your listings and drive organic traffic.', 'Etsy SEO is fundamentally different from Google SEO. The algorithm considers listing quality, recency, customer reviews, and conversion rate alongside keywords. Here is how to optimize for all of them...', 'Etsy', 'xComify Team', 'Etsy,SEO,Organic Growth', 'published', 98],
                ['TikTok Shop vs Amazon: Which Platform is Right for Your Brand in 2024?', 'tiktok-shop-vs-amazon-2024', 'A data-driven comparison of TikTok Shop and Amazon to help brand owners decide where to focus their eCommerce efforts.', 'Both platforms have exploded in 2024, but they serve fundamentally different buyers and business models. TikTok Shop rewards entertainment-first brands with strong visual identity. Amazon rewards operational excellence and review velocity...', 'Strategy', 'xComify Team', 'TikTok,Amazon,Strategy', 'published', 87],
                ['Shopify Conversion Rate Optimization: 10 Wins That Moved the Needle', 'shopify-cro-10-wins', 'The ten highest-impact CRO changes we have made across 50+ Shopify stores, ranked by average uplift.', 'After optimizing hundreds of Shopify stores, we have data on exactly which changes produce the biggest conversion lifts. Spoiler: it is rarely the hero image. Here are the ten changes we implement first on every new client store...', 'Shopify', 'xComify Team', 'Shopify,CRO,Conversion', 'published', 74],
                ['Product Research in 2024: The 5-Step Framework We Use for Every Client', 'product-research-framework-2024', 'Stop guessing. Here is the repeatable product research process we use to find winning products with proven demand and healthy margins.', 'Product research is where 90% of Amazon sellers fail before they even start. They pick products they love rather than products the market demands. Our five-step framework removes emotion from the equation entirely...', 'Amazon', 'xComify Team', 'Amazon,Product Research,FBA', 'published', 63],
                ['How We Launched a TikTok Shop Brand to $1M in 90 Days', 'tiktok-shop-1m-90-days-case-study', 'A detailed case study of how our team built a creator affiliate network and scaled a new TikTok Shop brand to $1M revenue in under three months.', 'When TechGadgets Pro came to us in January, they had zero TikTok presence and a 90-day goal that sounded unrealistic. This is the full story of what we did, week by week, to hit $1M...', 'Case Study', 'xComify Team', 'TikTok,Case Study,Launch', 'published', 201],
            ];
            $stmt = $this->pdo->prepare('INSERT INTO blogs (title, slug, excerpt, content, category, author, tags, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            foreach ($blogs as $b) { $stmt->execute($b); }
        }

        // Team
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM team')->fetchColumn() === 0) {
            $team = [
                ['Ahmad Raza', 'Founder & CEO', 'Serial entrepreneur with 8+ years in eCommerce. Built and scaled multiple 7-figure Amazon brands before founding xComify in 2018.', '', 'https://linkedin.com/in/ahmad-raza', '', 1],
                ['Sara Khan', 'Head of Amazon Operations', 'Amazon PPC specialist and FBA expert. Managed $5M+ in annual ad spend with an average ACoS of 17% across client accounts.', '', 'https://linkedin.com/in/sara-khan', '', 2],
                ['Michael Torres', 'Lead Shopify Developer', 'Full-stack developer specializing in Shopify theme development and conversion optimization. 100+ stores built and optimized.', '', 'https://linkedin.com/in/michael-torres', '', 3],
                ['Fatima Al-Rashid', 'TikTok & Social Commerce Lead', 'Grew multiple brands to 6-figures on TikTok Shop. Expert in creator partnerships, live selling, and social commerce strategy.', '', 'https://linkedin.com/in/fatima-alrashid', '', 4],
            ];
            $stmt = $this->pdo->prepare('INSERT INTO team (name, role, bio, image_path, linkedin, twitter, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)');
            foreach ($team as $t) { $stmt->execute($t); }
        }

        // Sample advertisement
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM advertisements')->fetchColumn() === 0) {
            $this->pdo->prepare(
                'INSERT INTO advertisements (title, description, cta_text, cta_link, bg_color, badge_text, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)'
            )->execute(['Free Amazon Audit — Limited Spots!', 'Get a free 30-minute Amazon account audit from our experts. We will identify your top 3 revenue leaks and tell you exactly how to fix them.', 'Claim Free Audit', '/contact', '#00D4FF', '🔥 Limited Offer']);
        }
    }

    private function initMySQL(): void {
        $tables = [
            "CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS applications (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
                phone VARCHAR(50), city VARCHAR(100), skills TEXT, experience TEXT,
                portfolio_link TEXT, expected_salary VARCHAR(100), cover_letter TEXT,
                cv_path TEXT, status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS contacts (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
                phone VARCHAR(50), company VARCHAR(255), platform VARCHAR(100),
                message TEXT NOT NULL, is_read TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS blogs (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
                excerpt TEXT, content LONGTEXT, category VARCHAR(100),
                author VARCHAR(255), tags TEXT, image_path TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'draft', views INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS services (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
                icon VARCHAR(100), short_desc TEXT, description LONGTEXT,
                features TEXT, color VARCHAR(50), sort_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS team (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL,
                bio TEXT, image_path TEXT, linkedin VARCHAR(500), twitter VARCHAR(500),
                sort_order INT DEFAULT 0, is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS portfolio (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL, category VARCHAR(100),
                challenge TEXT, solution TEXT, result TEXT,
                metrics TEXT, tags TEXT, image_path TEXT, color VARCHAR(50),
                is_featured TINYINT(1) DEFAULT 0, is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS testimonials (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL, company VARCHAR(255), role VARCHAR(255),
                content TEXT NOT NULL, rating INT DEFAULT 5, platform VARCHAR(100),
                revenue VARCHAR(100), image_path TEXT,
                is_featured TINYINT(1) DEFAULT 0, is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS settings (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `key` VARCHAR(255) UNIQUE NOT NULL, `value` TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS media (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL, original_name VARCHAR(255),
                mime_type VARCHAR(100), size INT, path TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS advertisements (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL, description TEXT,
                image_url TEXT, cta_text VARCHAR(100), cta_link VARCHAR(500),
                bg_color VARCHAR(20) DEFAULT '#00D4FF', badge_text VARCHAR(100),
                is_active TINYINT(1) DEFAULT 1, starts_at DATETIME, ends_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        ];

        foreach ($tables as $sql) {
            $this->pdo->exec($sql);
        }
    }

    private function initSQLite(): void {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL, email TEXT NOT NULL,
                phone TEXT, city TEXT, skills TEXT, experience TEXT,
                portfolio_link TEXT, expected_salary TEXT, cover_letter TEXT,
                cv_path TEXT, status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, email TEXT NOT NULL,
                phone TEXT, company TEXT, platform TEXT,
                message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS blogs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
                excerpt TEXT, content TEXT, category TEXT, author TEXT,
                tags TEXT, image_path TEXT, status TEXT NOT NULL DEFAULT 'draft',
                views INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
                icon TEXT, short_desc TEXT, description TEXT,
                features TEXT, color TEXT, sort_order INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS team (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, role TEXT NOT NULL,
                bio TEXT, image_path TEXT, linkedin TEXT, twitter TEXT,
                sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, category TEXT,
                challenge TEXT, solution TEXT, result TEXT,
                metrics TEXT, tags TEXT, image_path TEXT, color TEXT,
                is_featured INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, company TEXT, role TEXT,
                content TEXT NOT NULL, rating INTEGER DEFAULT 5,
                platform TEXT, revenue TEXT, image_path TEXT,
                is_featured INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL, value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL, original_name TEXT,
                mime_type TEXT, size INTEGER, path TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS advertisements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, description TEXT,
                image_url TEXT, cta_text TEXT, cta_link TEXT,
                bg_color TEXT DEFAULT '#00D4FF', badge_text TEXT,
                is_active INTEGER DEFAULT 1, starts_at DATETIME, ends_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
}
