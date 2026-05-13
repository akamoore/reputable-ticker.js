<?php
/**
 * The template for displaying the header
 *
 * Custom Reputable Health header for Hello Elementor.
 * Compatible with Hello Elementor 3.x and WordPress 6.x.
 *
 * @package HelloElementor
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$viewport_content = apply_filters( 'hello_elementor_viewport_content', 'width=device-width, initial-scale=1' );
$enable_skip_link = apply_filters( 'hello_elementor_enable_skip_link', true );
$skip_link_url = apply_filters( 'hello_elementor_skip_link_url', '#content' );
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="<?php echo esc_attr( $viewport_content ); ?>">
	<?php if ( ! current_theme_supports( 'title-tag' ) ) : ?>
		<title><?php echo wp_get_document_title(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></title>
	<?php endif; ?>
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<!-- External Assets -->
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

	<?php wp_head(); ?>

	<!-- Phosphor Icons — loaded after wp_head to avoid script-loading conflicts -->
	<script src="https://unpkg.com/@phosphor-icons/web"></script>

	<style>
		:root {
			--rh-lime: #D9FF85;
			--rh-charcoal: #222220;
			--rh-radius-pill: 100px;
		}

		/* ── RH Header ── */
		#rh-navbar {
			position: fixed !important;
			top: 0;
			left: 0;
			width: 100%;
			z-index: 99999;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1.5rem 3rem;
			background: rgba(34, 34, 32, 0.0);
			transition: all 0.3s ease;
			box-sizing: border-box;
		}

		#rh-navbar.scrolled {
			background: rgba(34, 34, 32, 0.95);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			padding: 1rem 3rem;
			border-bottom: 1px solid rgba(255,255,255,0.05);
		}

		#rh-navbar .logo {
			font-size: 1.5rem;
			font-weight: 700;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		#rh-navbar .logo a {
			display: flex;
			align-items: center;
			text-decoration: none;
		}

		#rh-navbar .logo img {
			height: 30px;
			width: auto;
			display: block;
		}

		#rh-navbar nav.desktop-nav {
			display: flex;
			align-items: center;
			gap: 2.5rem;
		}

		#rh-navbar nav.desktop-nav > a {
			font-size: 0.95rem;
			font-weight: 500;
			color: rgba(255,255,255,0.8);
			text-decoration: none;
			font-family: 'Poppins', sans-serif;
			transition: color 0.3s;
		}
		#rh-navbar nav.desktop-nav > a:hover { color: white; }

		/* Dropdowns */
		#rh-navbar .dropdown { position: relative; display: inline-block; height: 100%; }
		#rh-navbar .dropbtn {
			background: transparent;
			color: rgba(255,255,255,0.8);
			padding: 0.5rem 0;
			font-size: 0.95rem;
			border: none;
			cursor: pointer;
			font-weight: 500;
			font-family: 'Poppins', sans-serif;
			display: flex;
			align-items: center;
			gap: 0.3rem;
			transition: color 0.3s;
		}
		#rh-navbar .dropdown:hover .dropbtn { color: white; }

		#rh-navbar .dropdown-content {
			display: none;
			position: absolute;
			background-color: rgba(34, 34, 32, 0.98);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			min-width: 240px;
			box-shadow: 0 10px 30px rgba(0,0,0,0.5);
			border: 1px solid rgba(255,255,255,0.1);
			border-radius: 12px;
			z-index: 100000;
			top: 100%;
			left: -1rem;
			padding: 0.5rem 0;
			overflow: hidden;
		}
		#rh-navbar .dropdown-content a {
			color: rgba(255,255,255,0.8) !important;
			padding: 0.8rem 1.5rem;
			display: block;
			font-size: 0.9rem;
			transition: all 0.2s;
			text-decoration: none !important;
		}
		#rh-navbar .dropdown-content a:hover {
			background-color: rgba(255,255,255,0.05);
			color: var(--rh-lime) !important;
			padding-left: 1.8rem;
		}
		#rh-navbar .dropdown:hover .dropdown-content {
			display: block;
			animation: rhFadeIn 0.3s ease forwards;
		}

		/* Shared .nav-btn — works inside #rh-navbar AND .rh-mobile-overlay */
		#rh-navbar .nav-btn,
		.rh-mobile-overlay .nav-btn {
			padding: 0.7rem 1.5rem;
			background: transparent;
			color: var(--rh-lime);
			border: 1px solid var(--rh-lime);
			border-radius: var(--rh-radius-pill);
			font-size: 0.9rem;
			font-weight: 600;
			transition: all 0.3s;
			text-decoration: none !important;
			display: inline-block;
		}
		#rh-navbar .nav-btn:hover,
		.rh-mobile-overlay .nav-btn:hover {
			background: var(--rh-lime);
			color: var(--rh-charcoal);
		}

		/* Mobile toggle */
		#rh-navbar .mobile-toggle {
			display: none;
			color: white;
			font-size: 2rem;
			cursor: pointer;
			min-width: 48px;
			min-height: 48px;
			align-items: center;
			justify-content: center;
		}

		/* Mobile overlay */
		.rh-mobile-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100vh;
			height: 100svh;
			background: var(--rh-charcoal);
			z-index: 99998;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 6rem;
			padding-bottom: 2rem;
			gap: 1.5rem;
			opacity: 0;
			pointer-events: none;
			transition: all 0.3s ease;
			box-sizing: border-box;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
		}
		.rh-mobile-overlay.active { opacity: 1; pointer-events: all; }
		.rh-mobile-category {
			font-size: 0.8rem;
			color: var(--rh-lime);
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			margin-top: 1rem;
		}
		.rh-mobile-sublink {
			color: rgba(255,255,255,0.7);
			text-decoration: none;
			font-size: 1.1rem;
			padding: 0.25rem 0;
		}
		.rh-mobile-sublink:hover { color: white; }
		.rh-mobile-contact {
			color: white;
			text-decoration: none;
			font-weight: 600;
			margin-top: 1rem;
			font-size: 1.2rem;
		}

		@media (max-width: 1024px) {
			#rh-navbar { padding: 1rem 2rem; }
			#rh-navbar nav.desktop-nav { gap: 1.5rem; }
		}

		@media (max-width: 768px) {
			#rh-navbar nav.desktop-nav { display: none !important; }
			#rh-navbar .mobile-toggle { display: flex; }
		}

		@keyframes rhFadeIn {
			from { opacity: 0; transform: translateY(-10px); }
			to { opacity: 1; transform: translateY(0); }
		}
	</style>
</head>
<body <?php body_class(); ?>>

<?php wp_body_open(); ?>

<?php if ( $enable_skip_link ) { ?>
<a class="skip-link screen-reader-text" href="<?php echo esc_url( $skip_link_url ); ?>"><?php echo esc_html__( 'Skip to content', 'hello-elementor' ); ?></a>
<?php } ?>

<?php
do_action( 'hello_elementor_body_open' );
?>

<!-- Reputable Health Header -->
<header id="rh-navbar">
	<div class="logo">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<img src="https://verifiedbyreputable.com/wp-content/uploads/2025/12/white-Reputable-Logo.png" alt="Reputable Health">
		</a>
	</div>

	<nav class="desktop-nav">
		<div class="dropdown">
			<button class="dropbtn">Join a Study <i class="ph-bold ph-caret-down"></i></button>
			<div class="dropdown-content">
				<a href="<?php echo esc_url( home_url( '/heartbeats/' ) ); ?>">Heartbeats</a>
				<a href="<?php echo esc_url( home_url( '/join/' ) ); ?>">Join a Study</a>
			</div>
		</div>

		<div class="dropdown">
			<button class="dropbtn">Run a Study <i class="ph-bold ph-caret-down"></i></button>
			<div class="dropdown-content">
				<a href="<?php echo esc_url( home_url( '/why-reputable/' ) ); ?>">Why Reputable</a>
				<a href="<?php echo esc_url( home_url( '/customer-journey/' ) ); ?>">Our Process</a>
				<a href="<?php echo esc_url( home_url( '/study-report-sample/' ) ); ?>">View Sample Report</a>
			</div>
		</div>

		<div class="dropdown">
			<button class="dropbtn">Research and Articles <i class="ph-bold ph-caret-down"></i></button>
			<div class="dropdown-content">
				<a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Blog Posts</a>
				<a href="<?php echo esc_url( home_url( '/case-studies/' ) ); ?>">Case Studies</a>
				<a href="<?php echo esc_url( home_url( '/news-and-media/' ) ); ?>">News and Media</a>
				<a href="<?php echo esc_url( home_url( '/white-papers-2/' ) ); ?>">White Papers</a>
			</div>
		</div>

		<a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a>
		<a href="https://calendly.com/reputablehealth/intro" class="nav-btn" target="_blank" rel="noopener">Schedule a Call</a>
	</nav>

	<div class="mobile-toggle" role="button" aria-label="Toggle menu" tabindex="0">
		<i class="ph-bold ph-list"></i>
	</div>
</header>

<!-- Mobile Menu Overlay -->
<div class="rh-mobile-overlay" id="rh-mobile-overlay">
	<span class="rh-mobile-category">Join a Study</span>
	<a href="<?php echo esc_url( home_url( '/heartbeats/' ) ); ?>" class="rh-mobile-sublink">Heartbeats</a>
	<a href="<?php echo esc_url( home_url( '/join/' ) ); ?>" class="rh-mobile-sublink">Join a Study</a>

	<span class="rh-mobile-category">Run a Study</span>
	<a href="<?php echo esc_url( home_url( '/why-reputable/' ) ); ?>" class="rh-mobile-sublink">Why Reputable</a>
	<a href="<?php echo esc_url( home_url( '/customer-journey/' ) ); ?>" class="rh-mobile-sublink">Our Process</a>
	<a href="<?php echo esc_url( home_url( '/study-report-sample/' ) ); ?>" class="rh-mobile-sublink">View Sample Report</a>

	<span class="rh-mobile-category">Research and Articles</span>
	<a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>" class="rh-mobile-sublink">Blog Posts</a>
	<a href="<?php echo esc_url( home_url( '/case-studies/' ) ); ?>" class="rh-mobile-sublink">Case Studies</a>
	<a href="<?php echo esc_url( home_url( '/news-and-media/' ) ); ?>" class="rh-mobile-sublink">News and Media</a>
	<a href="<?php echo esc_url( home_url( '/white-papers-2/' ) ); ?>" class="rh-mobile-sublink">White Papers</a>

	<a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="rh-mobile-contact">Contact</a>
	<a href="https://calendly.com/reputablehealth/intro" class="nav-btn" target="_blank" rel="noopener" style="margin-top: 0.5rem;">Schedule a Call</a>
</div>

<script>
(function() {
	var nav = document.getElementById('rh-navbar');
	var toggle = nav ? nav.querySelector('.mobile-toggle') : null;
	var menu = document.getElementById('rh-mobile-overlay');

	if (nav) {
		window.addEventListener('scroll', function() {
			if (window.scrollY > 50) { nav.classList.add('scrolled'); }
			else { nav.classList.remove('scrolled'); }
		}, { passive: true });
	}

	if (toggle && menu) {
		var icon = toggle.querySelector('i');

		function toggleMenu() {
			menu.classList.toggle('active');
			if (menu.classList.contains('active')) {
				icon.classList.replace('ph-list', 'ph-x');
				document.body.style.overflow = 'hidden';
			} else {
				icon.classList.replace('ph-x', 'ph-list');
				document.body.style.overflow = '';
			}
		}

		toggle.addEventListener('click', toggleMenu);
		toggle.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
		});

		menu.querySelectorAll('a').forEach(function(link) {
			link.addEventListener('click', function() {
				menu.classList.remove('active');
				icon.classList.replace('ph-x', 'ph-list');
				document.body.style.overflow = '';
			});
		});
	}
})();
</script>
