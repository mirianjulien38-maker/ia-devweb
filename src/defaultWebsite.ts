export const DEFAULT_WEBSITE_CODE = `<!DOCTYPE html>
<html lang="mg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DEVWEB IA - Tongasoa</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            scroll-behavior: smooth;
        }
        .serif-font {
            font-family: 'Playfair Display', serif;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col overflow-x-hidden selection:bg-sky-500 selection:text-white">

    <!-- Header Navigation -->
    <header class="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" class="flex items-center gap-2.5">
                <div class="bg-gradient-to-tr from-sky-400 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-sky-500/20">
                    <i class="fa-solid fa-laptop-code text-lg"></i>
                </div>
                <span class="font-bold text-xl tracking-tight text-white uppercase">
                    Gastro<span class="text-sky-400">Art</span>
                </span>
            </a>
            
            <!-- Desktop Menu -->
            <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                <a href="#fandraisana" class="hover:text-sky-400 transition-colors">Fandraisana</a>
                <a href="#tolotra" class="hover:text-sky-400 transition-colors">Ny Tolotra</a>
                <a href="#momba" class="hover:text-sky-400 transition-colors">Momba anay</a>
                <a href="#fifandraisana" class="hover:text-sky-400 transition-colors">Hifandray</a>
            </nav>

            <div class="flex items-center gap-4">
                <button onclick="toggleDarkMode()" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 transition-all" title="Toggle Mode">
                    <i id="theme-icon" class="fa-solid fa-moon text-lg"></i>
                </button>
                <a href="#fifandraisana" class="hidden sm:inline-flex bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95">
                    Hanafatra
                </a>
                <!-- Mobile Menu Button -->
                <button onclick="toggleMobileMenu()" class="md:hidden text-slate-300 hover:text-white p-2">
                    <i id="menu-icon" class="fa-solid fa-bars text-xl"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden border-b border-slate-900 bg-slate-950 px-6 py-4 space-y-3">
            <a href="#fandraisana" onclick="toggleMobileMenu()" class="block text-slate-300 hover:text-white text-sm py-2">Fandraisana</a>
            <a href="#tolotra" onclick="toggleMobileMenu()" class="block text-slate-300 hover:text-white text-sm py-2">Ny Tolotra</a>
            <a href="#momba" onclick="toggleMobileMenu()" class="block text-slate-300 hover:text-white text-sm py-2">Momba anay</a>
            <a href="#fifandraisana" onclick="toggleMobileMenu()" class="block text-slate-300 hover:text-white text-sm py-2">Hifandray</a>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="fandraisana" class="pt-32 pb-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
            <span class="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/20">
                <i class="fa-solid fa-star text-[10px]"></i> Tranonkala Fanehoana Voalohany
            </span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Mamorona Tranonkala <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Matihanina</span> miaraka amin'ny AI
            </h1>
            <p class="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
                Ity dia tranonkala fampisehoana nataon'ny <strong>DEVWEB IA</strong> ho anao. Azonao ovaina mivantana araka ny dikan'ny fonao ity tranonkala ity mampiasa ny chat eo amin'ny ankavia na sintonina avy hatrany ho an'ny fitaovanao!
            </p>
            <div class="flex flex-wrap gap-4 pt-2">
                <a href="#tolotra" class="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-95">
                    Hijery bebe kokoa
                </a>
                <a href="#fifandraisana" class="bg-slate-900 hover:bg-slate-850 text-slate-200 text-sm font-semibold px-7 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                    Hifandray mivantana
                </a>
            </div>
        </div>
        <div class="relative flex justify-center items-center">
            <div class="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-25 animate-pulse"></div>
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Dashboard Preview" class="relative rounded-2xl border border-slate-800 shadow-2xl object-cover w-full h-[320px] sm:h-[400px]">
        </div>
    </section>

    <!-- Services / Features Section -->
    <section id="tolotra" class="py-20 bg-slate-900/40 border-y border-slate-900 px-6">
        <div class="max-w-7xl mx-auto space-y-12">
            <div class="text-center max-w-2xl mx-auto space-y-3">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Inona ny fahaizan'ny DEVWEB IA?</h2>
                <p class="text-slate-400 text-sm">Ny teknolojia farany indrindra sy ny stila matihanina indrindra no omenay anao.</p>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div class="bg-slate-950 border border-slate-900 p-6 rounded-2xl hover:border-sky-500/40 transition-all duration-300 group">
                    <div class="bg-sky-500/10 text-sky-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sky-500 group-hover:text-white transition-all">
                        <i class="fa-solid fa-bolt text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">Haingana sy Maivana</h3>
                    <p class="text-slate-400 text-xs leading-relaxed">
                        Ny kaody vokarinay dia nodiovina tsara mba handeha haingana dia haingana amin'ny finday sy solosaina rehetra.
                    </p>
                </div>

                <!-- Card 2 -->
                <div class="bg-slate-950 border border-slate-900 p-6 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 group">
                    <div class="bg-indigo-500/10 text-indigo-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <i class="fa-solid fa-mobile-screen-button text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">Responsive 100%</h3>
                    <p class="text-slate-400 text-xs leading-relaxed">
                        Mifanaraka tsara amin'ny haben'ny sary rehetra (solosaina, takelaka, finday) ny tranonkalanao.
                    </p>
                </div>

                <!-- Card 3 -->
                <div class="bg-slate-950 border border-slate-900 p-6 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                    <div class="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <i class="fa-solid fa-magic text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">Sary sy Effets kanto</h3>
                    <p class="text-slate-400 text-xs leading-relaxed">
                        Mampiasa sary tsara tarehy avy amin'ny Unsplash sy sary kely (Icons) isan-karazany mifanaraka amin'ny orinasanao.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="momba" class="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-2xl blur opacity-25 animate-pulse"></div>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team Work" class="relative rounded-2xl border border-slate-800 shadow-2xl object-cover w-full h-[320px]">
        </div>
        <div class="space-y-6 order-1 md:order-2">
            <h2 class="text-3xl font-extrabold text-white">Orinasa Manana Ambom-po Lehibe</h2>
            <p class="text-slate-400 text-sm leading-relaxed font-light">
                Ny asanay dia ny hanampy anao hanana toerana mendrika sy matihanina amin'ny tranonkala. Ny DEVWEB IA dia manolotra serivisy tsy manam-paharoa mba hanamorana ny famoronana tranonkala amin'ny alalan'ny faharanitan-tsaina artifisialy.
            </p>
            <div class="space-y-3.5">
                <div class="flex items-center gap-3">
                    <div class="text-sky-400 bg-sky-500/10 p-1.5 rounded-lg">
                        <i class="fa-solid fa-check text-sm"></i>
                    </div>
                    <span class="text-slate-200 text-xs font-semibold">Tetikasa vita mihoatra ny 1,500</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-sky-400 bg-sky-500/10 p-1.5 rounded-lg">
                        <i class="fa-solid fa-check text-sm"></i>
                    </div>
                    <span class="text-slate-200 text-xs font-semibold">Mpanjifa afa-po 99% manerana ny nosy</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-sky-400 bg-sky-500/10 p-1.5 rounded-lg">
                        <i class="fa-solid fa-check text-sm"></i>
                    </div>
                    <span class="text-slate-200 text-xs font-semibold">Mpanohana sy mpanitsy kaody maharitra</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact & Form Section -->
    <section id="fifandraisana" class="py-20 bg-slate-900/20 border-t border-slate-900 px-6">
        <div class="max-w-3xl mx-auto bg-slate-950 border border-slate-900 rounded-3xl p-8 sm:p-10 space-y-8 relative">
            <div class="text-center space-y-2">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Hanomboka ny Tetikasanao?</h2>
                <p class="text-slate-400 text-xs">Fenoy ny taratasy eto ambany mba handefasana ny hevitrao mivantana.</p>
            </div>

            <form onsubmit="handleFormSubmit(event)" class="space-y-4">
                <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-slate-400 text-xs font-semibold">Anarana feno</label>
                        <input type="text" id="form-name" required placeholder="Ohatra: Julien" class="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-slate-400 text-xs font-semibold">Adiresy Email</label>
                        <input type="email" id="form-email" required placeholder="ohatra@gmail.com" class="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all">
                    </div>
                </div>
                <div class="space-y-1.5">
                    <label class="text-slate-400 text-xs font-semibold">Hafatra na Tetikasa tiana hatao</label>
                    <textarea id="form-message" rows="4" required placeholder="Soraty eto ny antsipirian'ny tranonkala tianao hamboarina..." class="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all resize-none"></textarea>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95">
                    Alefaso ny Hafatra
                </button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-slate-500 text-xs">
        <p>© 2026 GastroArt. Zo rehetra voatokana. Tranonkala fanehoana vokarina tamin'ny alàlan'ny DEVWEB IA.</p>
    </footer>

    <!-- Interactive success modal -->
    <div id="success-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div class="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <div class="space-y-1.5">
                <h4 class="text-white font-bold text-lg">Tafalefa soa aman-tsara!</h4>
                <p id="success-modal-text" class="text-slate-400 text-xs leading-relaxed">
                    Misaotra anao Julien, voaray ny hafatrao. Hifandray aminao tsy ho ela izahay.
                </p>
            </div>
            <button onclick="closeModal()" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-all">
                Hakatona
            </button>
        </div>
    </div>

    <!-- JavaScript code for interactivity -->
    <script>
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                menu.classList.add('hidden');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }

        function toggleDarkMode() {
            const body = document.body;
            const icon = document.getElementById('theme-icon');
            if (body.classList.contains('bg-slate-950')) {
                // Switch to light mode
                body.classList.remove('bg-slate-950', 'text-slate-100');
                body.classList.add('bg-slate-50', 'text-slate-800');
                
                // Card modifications inside page
                document.querySelectorAll('.bg-slate-950').forEach(el => {
                    el.classList.remove('bg-slate-950');
                    el.classList.add('bg-white');
                });
                document.querySelectorAll('.border-slate-900').forEach(el => {
                    el.classList.remove('border-slate-900');
                    el.classList.add('border-slate-200');
                });
                
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                // Switch to dark mode
                body.classList.remove('bg-slate-50', 'text-slate-800');
                body.classList.add('bg-slate-950', 'text-slate-100');

                document.querySelectorAll('.bg-white').forEach(el => {
                    el.classList.remove('bg-white');
                    el.classList.add('bg-slate-950');
                });
                document.querySelectorAll('.border-slate-200').forEach(el => {
                    el.classList.remove('border-slate-200');
                    el.classList.add('border-slate-900');
                });
                
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        function handleFormSubmit(event) {
            event.preventDefault();
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;

            // Change modal text
            document.getElementById('success-modal-text').innerHTML = 'Misaotra anao <strong>' + name + '</strong>, voaray ny hafatrao momba ny tetikasanao. Handefa mailaka any amin\\'ny <strong>' + email + '</strong> ny ekipanay.';
            
            // Show modal
            const modal = document.getElementById('success-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            // Reset form
            event.target.reset();
        }

        function closeModal() {
            const modal = document.getElementById('success-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    </script>
</body>
</html>`;
