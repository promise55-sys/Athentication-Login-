(() => {
	'use strict';

	const pageIds = ['about', 'how-it-works', 'opportunities', 'guidelines', 'privacy', 'help'];
	const pages = new Map(Array.from(document.querySelectorAll('[data-guide-page]'), (page) => [page.dataset.guidePage, page]));
	const navigationLinks = Array.from(document.querySelectorAll('[data-guide-link]'));
	const previousLink = document.getElementById('guidePrevious');
	const nextLink = document.getElementById('guideNext');
	const guideLanguage = document.getElementById('guideLanguage');

	function showPage() {
		const pageId = location.hash.slice(1);
		const current = pageIds.includes(pageId) ? pageId : 'about';
		const currentIndex = pageIds.indexOf(current);
		for (const [id, page] of pages) page.hidden = id !== current;
		for (const link of navigationLinks) {
			if (link.dataset.guideLink === current) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		}
		previousLink.href = `#${pageIds[Math.max(0, currentIndex - 1)]}`;
		previousLink.hidden = currentIndex === 0;
		nextLink.href = `#${pageIds[Math.min(pageIds.length - 1, currentIndex + 1)]}`;
		nextLink.hidden = currentIndex === pageIds.length - 1;
		if (!pageId) history.replaceState(null, '', `${location.pathname}${location.search}#about`);
		window.scrollTo(0, 0);
	}

	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener('click', (event) => {
			const target = link.getAttribute('href');
			if (!pageIds.includes(target.slice(1))) return;
			event.preventDefault();
			if (location.hash !== target) history.pushState(null, '', target);
			showPage();
		});
	});
	window.addEventListener('hashchange', showPage);
	window.addEventListener('popstate', showPage);
	showPage();

	if (guideLanguage) {
		const savedLanguage = localStorage.getItem('mw-language');
		if (savedLanguage && Array.from(guideLanguage.options).some((option) => option.value === savedLanguage)) guideLanguage.value = savedLanguage;
		window.MWLocale?.apply(guideLanguage.value);
		guideLanguage.addEventListener('change', () => {
			window.MWLocale?.apply(guideLanguage.value);
			document.documentElement.lang = guideLanguage.value;
			localStorage.setItem('mw-language', guideLanguage.value);
			filterFaqs();
		});
	}

	const search = document.getElementById('faqSearch');
	const resultCount = document.getElementById('faqResultCount');
	const emptyMessage = document.getElementById('faqEmpty');
	const faqItems = Array.from(document.querySelectorAll('.guide-faq-item'));
	const filters = Array.from(document.querySelectorAll('[data-faq-filter]'));
	let activeCategory = 'all';

	function filterFaqs() {
		const query = search.value.trim().toLocaleLowerCase();
		let visibleCount = 0;
		for (const item of faqItems) {
			const matchesCategory = activeCategory === 'all' || item.dataset.faqCategory === activeCategory;
			const matchesQuery = !query || item.textContent.toLocaleLowerCase().includes(query);
			item.hidden = !(matchesCategory && matchesQuery);
			if (!item.hidden) visibleCount += 1;
		}
		const countLabel = visibleCount === 1 ? 'question' : 'questions';
		resultCount.textContent = `${visibleCount} ${window.MWLocale?.translate(countLabel) || countLabel}`;
		emptyMessage.hidden = visibleCount > 0;
	}

	search.addEventListener('input', filterFaqs);
	for (const button of filters) {
		button.addEventListener('click', () => {
			activeCategory = button.dataset.faqFilter;
			for (const filter of filters) {
				const selected = filter === button;
				filter.classList.toggle('active', selected);
				filter.setAttribute('aria-pressed', String(selected));
			}
			filterFaqs();
		});
	}
	filterFaqs();
})();
