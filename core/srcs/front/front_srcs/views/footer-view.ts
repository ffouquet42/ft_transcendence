class FooterView extends HTMLElement {
  	connectedCallback() {
		this.innerHTML = `
			<!-- FOOTER -->
	  		<footer class="bg-gray-800 py-10 text-gray-400 text-sm">
				<div class="max-w-7xl mx-auto px-4">
		  			<div class="flex flex-col items-center space-y-8">
			
						<!-- Legal -->
						<div class="flex flex-col items-center space-y-2">
			  				<p class="font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Legal</p>
			  				<div class="flex flex-wrap justify-center gap-4">
								<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" target="_blank" class="relative transition duration-300 ease-in-out hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-gradient-to-r after:from-indigo-400 after:via-purple-500 after:to-pink-500 after:transition-all after:duration-300">Terms and Conditions</a>
			  				</div>
			  				<div class="flex flex-wrap justify-center gap-4">
								<p class="text-gray-500 mt-4 text-center">&copy; 2025 Pong Game. All rights not reserved.</p>
			  				</div>
						</div>
		  			</div>
				</div>
	  		</footer>
		`;
  	}
}

customElements.define('footer-view', FooterView);