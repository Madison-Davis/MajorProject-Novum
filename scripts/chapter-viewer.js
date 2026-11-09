const chapters = document.querySelectorAll('.tpl-chapter');
    const chapterLinks = document.querySelectorAll('.toc-link');
    const sectionLinks = document.querySelectorAll('.toc-section-link');

    const animations = new WeakMap();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function animateHeight(element, from, to, finish) {
      animations.get(element)?.cancel();
      element.style.overflow = 'hidden';
      const animation = element.animate(
        [{ height: from + 'px' }, { height: to + 'px' }],
        { duration: reducedMotion.matches ? 0 : 320, easing: 'cubic-bezier(.22, .61, .36, 1)' }
      );
      animations.set(element, animation);
      animation.onfinish = () => {
        animations.delete(element);
        element.style.overflow = '';
        finish();
      };
    }

    function slideSidebar(element, expand) {
      const from = element.hidden ? 0 : element.getBoundingClientRect().height;
      element.hidden = false;
      animateHeight(element, from, expand ? element.scrollHeight : 0, () => {
        element.hidden = !expand;
      });
    }

    function setSection(section, expand) {
      const from = section.getBoundingClientRect().height;
      section.dataset.expanded = String(expand);
      section.open = true;
      const summaryHeight = section.querySelector('summary').getBoundingClientRect().height;
      const padding = parseFloat(getComputedStyle(section).paddingBottom);
      animateHeight(section, from, expand ? section.scrollHeight : summaryHeight + padding + 1, () => {
        section.open = expand;
      });
    }

    document.querySelectorAll('.tpl-section').forEach(section => {
      section.dataset.expanded = String(section.open);
      section.querySelector('summary').addEventListener('click', event => {
        event.preventDefault();
        selectSection(section);
      });
    });

    function selectSection(section) {
      const expand = section.dataset.expanded !== 'true';
      section.closest('.tpl-chapter').querySelectorAll('.tpl-section').forEach(other => {
        const desired = other === section && expand;
        if ((other.dataset.expanded === 'true') !== desired) setSection(other, desired);
      });
      syncSections();
    }

    function syncSections() {
      sectionLinks.forEach(link => {
        const section = document.getElementById(link.dataset.section);
        const expanded = section.dataset.expanded === 'true';
        link.setAttribute('aria-expanded', String(expanded));
        link.classList.toggle('is-active', expanded);
      });
    }

    chapterLinks.forEach(link => {
      link.addEventListener('click', () => {
        const target = document.getElementById(link.dataset.target);
        const expand = link.getAttribute('aria-expanded') !== 'true';
        chapterLinks.forEach(button => {
          const selected = button === link && expand;
          button.setAttribute('aria-expanded', String(selected));
          button.classList.toggle('is-active', selected);
          slideSidebar(document.getElementById(button.getAttribute('aria-controls')), selected);
        });
        chapters.forEach(chapter => chapter.classList.toggle('is-active', chapter === target && expand));
        if (expand && !target.querySelector('.tpl-section[data-expanded="true"]')) {
          const first = target.querySelector('.tpl-section');
          if (first) setSection(first, true);
        }
        syncSections();
      });
    });

    sectionLinks.forEach(link => {
      link.addEventListener('click', () => {
        const section = document.getElementById(link.dataset.section);
        selectSection(section);
      });
    });

    syncSections();
