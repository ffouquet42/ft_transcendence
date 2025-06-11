class HomeView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
			<!-- HERO -->
			<section class="relative bg-slate-900 text-white py-32 px-6 sm:py-40 lg:px-8">
				<div class="max-w-3xl mx-auto text-center">
					<h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl">Welcome to the<br><span class="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0">PONG GAME</span></h1>
					<p class="mt-6 text-lg leading-8 text-gray-100">Challenge your friends, climb the leaderboard, and experience the revival of a retro classic rebuilt by students at 42 for the modern web.</p>
					<div class="mt-10 flex justify-center">
						<a href="/game" class="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition">Play Now</a>
					</div>
				</div>
			</section>
			
			<!-- BENTO -->
			<div class="bg-gray-50 py-24 sm:py-32">
				<div class="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
					<h2 class="text-center text-base/7 font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">How It’s Built</h2>
					<p class="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">Core milestones of our development journey</p>
					<div class="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">

						<!-- Server -->
						<div class="relative lg:row-span-2">
							<div class="absolute inset-px rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
							<div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
								<div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
									<p class="mt-2 text-lg font-medium tracking-tight max-lg:text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Server with Docker</p>
									<p class="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">Application with a robust backend infrastructure using Docker for containerization and deployment. Built for performance, scalability, and real-time communication.</p>
								</div>
								<div class="relative min-h-120 w-full grow">
									<div class="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
										<div class="flex bg-gray-800/40 ring-1 ring-white/5">
											<div class="-mb-px flex text-sm/6 font-medium text-gray-400">
												<div class="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">Dockerfile</div>
												<div class="border-r border-gray-600/10 px-4 py-2">docker-compose.yml</div>
											</div>
										</div>
										<div class="px-6 pt-6 pb-14">
											<p class="text-sm font-mono leading-relaxed"><code>
												<span class="text-[#569CD6]">services</span>:<br>
												&nbsp;&nbsp;<span class="text-[#DCDCAA]">back</span>:<br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">container_name</span>: <span class="text-[#CE9178]">back</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">image</span>: <span class="text-[#CE9178]">back</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">build</span>:<br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">context</span>: <span class="text-[#CE9178]">./back</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">dockerfile</span>: <span class="text-[#CE9178]">Dockerfile</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">working_dir</span>: <span class="text-[#CE9178]">/usr/src/app</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">ports</span>:<br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <span class="text-[#CE9178]">&quot;3000:3000&quot;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">env_file</span>: <span class="text-[#CE9178]">../.env</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#9CDCFE]">volumes</span>:<br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="text-[#CE9178]">sqlite_data:/data</span><br>
											</code></p>
										</div>
									</div>
								</div>
							</div>
							<div class="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
						</div>

						<!-- Game -->
						<div class="relative max-lg:row-start-1">
							<div class="absolute inset-px rounded-lg bg-white max-lg:rounded-t-4xl"></div>
							<div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
								<div class="px-8 pt-8 sm:px-10 sm:pt-10">
									<p class="mt-2 text-lg font-medium tracking-tight max-lg:text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Game Development</p>
									<p class="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">Play a modern take on the classic Pong game with real-time multiplayer support. Challenge your friends and climb the leaderboard through competitive tournaments.</p>
								</div>
								<div class="flex flex-1 items-center justify-center gap-6 text-6xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
									
								</div>
							</div>
							<div class="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-t-4xl"></div>
						</div>

						<!-- Security -->
						<div class="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
							<div class="absolute inset-px rounded-lg bg-white"></div>
							<div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
								<div class="px-8 pt-8 sm:px-10 sm:pt-10">
									<p class="mt-2 text-lg font-medium tracking-tight max-lg:text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Security & 2FA</p>
									<p class="mt-2 mb-8 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">Keep your data safe with strong encryption, secure authentication, and protection against common vulnerabilities. Two-Factor Authentication (2FA) adds an extra layer of security to ensure only you can access your account.</p>
								</div>
							</div>
							<div class="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5"></div>
						</div>
						
						<!-- Tailwind CSS Only -->
						<div class="relative lg:row-span-2">
							<div class="absolute inset-px rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
							<div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
								<div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
									<p class="mt-2 text-lg font-medium tracking-tight max-lg:text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Tailwind CSS Only</p>
									<p class="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">Crafted entirely with Tailwind CSS for rapid prototyping, consistent design, and responsive interfaces.</p>
								</div>
								<div class="relative min-h-120 w-full grow">
									<div class="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
										<div class="flex bg-gray-800/40 ring-1 ring-white/5">
											<div class="-mb-px flex text-sm/6 font-medium text-gray-400">
												<div class="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">tailwind.config.js</div>
												<div class="border-r border-gray-600/10 px-4 py-2">index.html</div>
											</div>
										</div>
										<div class="px-6 pt-6 pb-14">
											<p class="text-sm font-mono leading-relaxed"><code>
												<span class="text-[#6A9955]">&lt;!-- NAVBAR --&gt;</span><br>
												<span class="text-[#569CD6]">&lt;nav</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;bg-gray-800 py-6 px-4 text-lg&quot;</span><span class="text-[#569CD6]">&gt;</span><br>
												&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;div</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;max-w-7xl mx-auto flex flex-wrap items-center justify-between&quot;</span><span class="text-[#569CD6]">&gt;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;div</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0&quot;</span><span class="text-[#569CD6]">&gt;</span>PONG GAME<span class="text-[#569CD6]">&lt;/div&gt;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;div</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;w-full sm:flex-1 flex flex-wrap justify-center gap-4 mb-4 sm:mb-0&quot;</span><span class="text-[#569CD6]">&gt;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;a</span> <span class="text-[#9CDCFE]">href</span>=<span class="text-[#CE9178]">&quot;/&quot;</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;relative transition duration-300 ease-in-out hover:text-indigo-500 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-indigo-500 after:transition-all after:duration-300&quot;</span><span class="text-[#569CD6]">&gt;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-white">&lt;<span class="text-[#569CD6]">i</span> <span class="text-[#9CDCFE]">class</span>=<span class="text-[#CE9178]">&quot;fa-solid fa-house&quot;</span>&gt;&lt;/<span class="text-[#569CD6]">i</span>&gt; Home</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;/a&gt;</span><br>
												&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;/div&gt;</span><br>
												&nbsp;&nbsp;<span class="text-[#569CD6]">&lt;/div&gt;</span><br>
												<span class="text-[#569CD6]">&lt;/nav&gt;</span><br>
											</code></p>
										</div>
									</div>
								</div>
							</div>
							<div class="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- TEAM -->
			<div class="bg-slate-900 py-24 sm:py-32">
  				<div class="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
					<div class="max-w-xl">
	  					<h2 class="text-3xl font-semibold tracking-tight text-pretty sm:text-4xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Our Team</h2>
	  					<p class="mt-6 text-lg/8">
							We are students from 42, a computer programming school, collaborating on a group project as part of our academic journey.
	  					</p>
					</div>
					<ul role="list" class="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
	  
	  					<!-- Member 1 -->
	  					<li>
							<div class="flex items-center gap-x-6">
		  						<div class="text-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								</div>
		  						<div>
									<h3 class="text-base/7 font-semibold tracking-tight">
			  							<a href="https://github.com/AK7iwi" target="_blank"
  											class="relative transition duration-300 ease-in-out
											hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500
											after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0
											hover:after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:via-purple-500 after:to-pink-500
											after:transition-all after:duration-300">mfeldman
										</a>
									</h3>
									<p class="text-sm/6 font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
			   							Server Development
									</p>
		  						</div>
							</div>
	  					</li>

	  					<!-- Member 2 -->
	  					<li>
							<div class="flex items-center gap-x-6">
		  						<div class="text-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								</div>
		  						<div>
									<h3 class="text-base/7 font-semibold tracking-tight">
			  							<a href="https://github.com/GigotBlaster" target="_blank"
											class="relative transition duration-300 ease-in-out
											hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500
											after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0
											hover:after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:via-purple-500 after:to-pink-500
											after:transition-all after:duration-300">npetitpi
										</a>
									</h3>
									<p class="text-sm/6 font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
			  				 			Security and Protection
									</p>
		  						</div>
							</div>
	  					</li>

	  					<!-- Member 3 -->
	  					<li>
							<div class="flex items-center gap-x-6">
		  						<div class="text-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								</div>
		  						<div>
									<h3 class="text-base/7 font-semibold tracking-tight">
			  							<a href="https://github.com/NineSama" target="_blank"
											class="relative transition duration-300 ease-in-out
											hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500
											after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0
											hover:after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:via-purple-500 after:to-pink-500
											after:transition-all after:duration-300">mfroissa
										</a>
									</h3>
									<p class="text-sm/6 font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
			   							Pong Game Design
									</p>
		  						</div>
							</div>
	  					</li>

	  					<!-- Member 4 -->
	  					<li>
							<div class="flex items-center gap-x-6">
		  						<div class="text-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								</div>
		  						<div>
									<h3 class="text-base/7 font-semibold tracking-tight">
			  							<a href="https://github.com/ffouquet42" target="_blank"
  											class="relative transition duration-300 ease-in-out
											hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500
											after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0
											hover:after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:via-purple-500 after:to-pink-500
											after:transition-all after:duration-300">fllanet
										</a>
									</h3>
									<p class="text-sm/6 font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
			   							UI & Visual Design
									</p>
		  						</div>
							</div>
	  					</li>
					</ul>
  				</div>
			</div>

			<!-- TECHNOLOGIES -->
				<div class="bg-white py-20">
					<div class="mx-auto max-w-7xl px-6 lg:px-8">
						<h2 class="text-3xl sm:text-4xl text-center text-lg/8 font-semibold mb-20 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
						Technologies we used
						</h2>
						<div class="mx-auto mt-10 grid max-w-lg grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 sm:gap-x-10 lg:mx-0 lg:max-w-none">
						
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							JavaScript
							</span>
						</div>
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							TypeScript
							</span>
						</div>
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							Tailwind CSS
							</span>
						</div>
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							Vite
							</span>
						</div>
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							WebSocket
							</span>
						</div>
						<div class="flex justify-center">
							<span class="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							Docker
							</span>
						</div>
					</div>
				</div>
  			</div>
		</div>
		`;
	}
}

customElements.define('home-view', HomeView);