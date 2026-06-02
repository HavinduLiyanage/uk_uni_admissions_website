(function () {
  const DATA = window.UKADMIT_DATA || { universities: [] };
  const universities = (DATA.universities || []).filter((university) => university.is_active !== false);
  const programmes = universities.flatMap((university) =>
    (university.programmes || [])
      .filter((programme) => programme.is_active !== false)
      .map((programme) => ({
        ...programme,
        university: {
          name: university.name,
          slug: university.slug,
          location: university.location,
          city: university.city,
          country: university.country
        }
      }))
  );

  const programmeImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB6uxKkpMfg9Rp9uSH43XAnit2X4oB9TkXLdMXblTiBc7K2gwI3IHS8JpIKWINcY04R9x5-UnCIGh2leM4G_OEIbUA5Z2KEcvCQxphhm3ZjuNyO_gIMzpDOZA7Rj-uwcbs-aVQgpuvQri936auFkt-wF-ng1cW8qe7hzV6I13ZYCwV6zRVhLuX_RMly62-K5kEgUUeq7OMGenPBmEmHbomWUFZWOM5izmruwBuE54hEjpbTJClO5FS85pN3DlRr9jCKE1fb2rsYsuo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBfM2ybX6m1kPEg81FZyZ_zvNs3AnMsgQHrL797Ie5Bvr_LPl1UdtDNCRA3ctFowVVSfxGdeDjXZ1fx_tlTY4pW-0-0nWrzmUWysaje6bHYCGlBb2KhrLG4uTuiHG8IsWeePLxfbl09o8ZRRSGFZBNx7J0pdDEe2yfzkyVZZPbc2E9qPW0xl3phWZDCj2T2U2sVZuCcclCM6z9oAuCy14a9_sEQu8nuIwPb5pZUVg3hugurAYrUVyanI_Js8tVMcX6d-tzw6cCwNqk",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9Aki1MzQnJ3KdWtLIfTqKxxpPpi6pe9BqGdMYM7Im_Od7J8PQzQoVgl8oKAMbOEGiKSq47fehmialuK2P_ulHfmU7K4VGsfmmynDwq06kZHdWvTdNEISn7gan49AX3jMKCVngomDijW6HMq8zu9GvQYHIwYTovKGnXBSfFgBhyTl--RSdTyqYHafgAO9QeHWGTehr7xqOq-kYm-srRNUxAfP8JAwJ7t5ByFrAFUE5tGOtRpG_npjt9L0W6lr-AMOQTGLIzG-nAHw"
  ];

  const universityImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDt49JdVlR1Qxl167-aEquOVWui4YLRW4IQPW8ipa40l-C7ezlJgNtr6snqUViqTT8fNbhENfx5-KC6KcjuDheYNyTIUB0_odVjSp9Gkb8NpUp79tqj3do-3EWyozkJ3EFSTB1GYobVWLM9tnqaqXY7F0LmeBYMWJ8FWzIsr3fYnywCtxT56I5NwORRBglT7KIh_3rqatrUb_EjgPUJQqcA1fyjfP8um5yGKXudKqOFfU3wHnF3vpi_mKgXja3CyXKzU1LSWnZSs_0";
  const universityCardImageSlugOverrides = {
    "the-university-of-buckingham": "university-of-buckingham",
    "university-of-the-west-of-england-uwe": "university-of-the-west-of-england"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function yearsFromMonths(months) {
    if (!months) return "Duration varies";
    if (months % 12 === 0) {
      const years = months / 12;
      return `${years} ${years === 1 ? "Year" : "Years"}`;
    }
    return `${months} Months`;
  }

  function titleCase(value) {
    return String(value || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function compactList(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function programmeCountText(count, fallback = "Programme guidance available") {
    if (count === 1) return "1 listed programme";
    if (count > 1) return `${count} listed programmes`;
    return fallback;
  }

  function pluralize(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function subjectIcon(subject) {
    const text = String(subject || "").toLowerCase();
    if (text.includes("business")) return "business_center";
    if (text.includes("computer")) return "computer";
    if (text.includes("engineering")) return "engineering";
    if (text.includes("health")) return "biotech";
    if (text.includes("law")) return "gavel";
    if (text.includes("architecture")) return "architecture";
    if (text.includes("media")) return "campaign";
    if (text.includes("hospitality")) return "travel_explore";
    if (text.includes("art") || text.includes("design")) return "palette";
    return "school";
  }

  function programmeImage(programme) {
    const index = Math.abs(String(programme.slug || programme.title).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % programmeImages.length;
    return programmeImages[index];
  }

  function universityCardImage(university) {
    const slug = universityCardImageSlugOverrides[university.slug] || university.slug;
    return `assets/universities/${slug}.jpg`;
  }

  function programmeUrl(programme) {
    return `bsc-computer-science.html?programme=${encodeURIComponent(programme.slug)}`;
  }

  function universityUrl(university) {
    return `university-coventry.html?university=${encodeURIComponent(university.slug)}`;
  }

  function renderRankingBadges(university) {
    const badges = [];
    if (university.the_ranking) {
      badges.push(
        '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 font-body-md">' +
        'THE ' + escapeHtml(university.the_ranking) +
        '</span>'
      );
    }
    if (university.qs_ranking) {
      badges.push(
        '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 font-body-md">' +
        'QS ' + escapeHtml(university.qs_ranking) +
        '</span>'
      );
    }
    if (university.tef_rating) {
      const isGold = university.tef_rating === 'Gold';
      const cls = isGold
        ? 'bg-amber-50 border-amber-200 text-amber-700'
        : 'bg-slate-50 border-slate-200 text-slate-600';
      badges.push(
        '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border font-body-md ' + cls + '">' +
        'TEF ' + escapeHtml(university.tef_rating) +
        '</span>'
      );
    }
    if (badges.length === 0) return '';
    return '<div class="flex flex-wrap gap-1.5 mt-2 mb-3">' +
           badges.slice(0, 2).join('') +
           '</div>';
  }

  function renderProgrammeRankingPills(programme) {
    return programme?.university ? renderRankingBadges(programme.university) : '';
  }

  function renderUniversityCard(university) {
    const activeProgrammes = (university.programmes || []).filter((programme) => programme.is_active !== false);
    const subjects = compactList(activeProgrammes.map((programme) => programme.subject_area));
    const shownSubjects = subjects.slice(0, 3);
    const extraCount = subjects.length - shownSubjects.length;
    const subjectsHtml = shownSubjects
      .map((subject) => `<span class="px-3 py-1 bg-surface-container rounded-lg font-body-md text-[13px] text-on-surface">${escapeHtml(subject)}</span>`)
      .join("");
    const description = activeProgrammes.length
      ? `Explore ${activeProgrammes.length} programmes at ${escapeHtml(university.name)} across ${subjects.length || "multiple"} study areas.`
      : `Programme listings for ${escapeHtml(university.name)} are being added. Contact UKAdmit for current application guidance.`;
    const subjectSummary = subjectsHtml || `<span class="px-3 py-1 bg-surface-container rounded-lg font-body-md text-[13px] text-on-surface">Programme guidance available</span>`;
    return `
      <article class="bg-surface-container-lowest rounded-[24px] overflow-hidden shadow-[0px_10px_30px_rgba(11,31,58,0.05)] hover:shadow-[0px_20px_40px_rgba(11,31,58,0.08)] transition-all duration-300 group border border-transparent hover:border-secondary/20 flex flex-col h-full">
        <div class="h-48 overflow-hidden">
          <img
            src="${universityCardImage(university)}"
            alt="${escapeHtml(university.name)} - ${escapeHtml(university.city)}"
            class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onerror="this.src='assets/universities/oxford-brookes-university.jpg'"
          />
        </div>
        <div class="p-8 flex flex-col flex-grow">
          <div class="mb-4">
            <h3 class="font-headline-md text-[22px] text-primary leading-tight mb-1">${escapeHtml(university.name)}</h3>
            <div class="flex items-center text-on-surface-variant gap-1">
              <span class="material-symbols-outlined text-[16px]">location_on</span>
              <span class="font-body-md text-[14px]">${escapeHtml(university.location || university.city || university.country)}</span>
            </div>
          </div>
          ${renderRankingBadges(university)}
          <p class="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-3">
            ${description}
          </p>
          <div class="mb-8 flex flex-wrap gap-2 mt-auto">
            ${subjectSummary}
            ${extraCount > 0 ? `<span class="px-3 py-1 bg-surface-container rounded-lg font-body-md text-[13px] text-on-surface">+${extraCount} more</span>` : ""}
          </div>
          <div class="flex gap-3 mt-auto">
            <a class="flex-1 py-3 px-4 rounded-xl border-2 border-primary text-primary font-label-bold text-label-bold hover:bg-primary hover:text-on-primary transition-colors text-center" href="${universityUrl(university)}">View Programmes</a>
            <a class="flex-1 py-3 px-4 rounded-xl bg-secondary text-on-secondary font-label-bold text-label-bold hover:bg-secondary/90 transition-colors text-center shadow-sm" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in studying at ' + university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire</a>
          </div>
        </div>
      </article>`;
  }

  function renderProgrammeCard(programme) {
    return `
      <article class="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(11,31,58,0.05)] p-[32px] hover:shadow-[0px_15px_40px_rgba(11,31,58,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-secondary flex flex-col gap-5">
        <div class="relative h-48 rounded-lg overflow-hidden">
          <img alt="${escapeHtml(programme.subject_area)} students" class="w-full h-full object-cover" src="${programmeImage(programme)}"/>
          <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
            <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">${subjectIcon(programme.subject_area)}</span>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <span class="bg-primary-fixed text-on-primary-fixed rounded-full px-3 py-1 font-label-bold text-label-bold text-xs">${escapeHtml(programme.degree_type || titleCase(programme.degree_level))}</span>
          <span class="bg-surface-container-high text-on-surface rounded-full px-3 py-1 font-label-bold text-label-bold text-xs flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">schedule</span> ${yearsFromMonths(programme.duration_months)}
          </span>
          <span class="bg-surface-container-high text-on-surface rounded-full px-3 py-1 font-label-bold text-label-bold text-xs">${escapeHtml(programme.subject_area || "Programme")}</span>
        </div>
        <div>
          <h3 class="font-headline-md text-headline-md text-primary text-2xl leading-tight mb-2">${escapeHtml(programme.title)}</h3>
          <p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">account_balance</span>
            ${escapeHtml(programme.university.name)}
          </p>
          ${renderProgrammeRankingPills(programme)}
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant line-clamp-3">${escapeHtml(programme.overview || "Contact UKAdmit for detailed course guidance and application support.")}</p>
        <div class="mt-auto flex gap-4 pt-4 border-t border-surface-variant">
          ${programme.official_course_url
            ? `<a class="flex-1 border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-white transition-colors rounded-xl font-label-bold text-label-bold py-3 text-center flex items-center justify-center gap-1.5" href="${escapeHtml(programme.official_course_url)}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[16px]">open_in_new</span>Official Course Page</a>`
            : `<a class="flex-1 border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-white transition-colors rounded-xl font-label-bold text-label-bold py-3 text-center" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire for Details</a>`}
          <a class="flex-1 bg-secondary text-on-secondary hover:bg-secondary-container transition-colors rounded-xl font-label-bold text-label-bold py-3 text-center shadow-sm" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire Now</a>
        </div>
      </article>`;
  }

  function renderHomeUniversityCard(university) {
    const activeProgrammes = (university.programmes || []).filter((programme) => programme.is_active !== false);
    return `
      <div class="bg-white rounded-[24px] p-8 shadow-sm hover:shadow-[0px_20px_40px_rgba(11,31,58,0.12)] hover:-translate-y-2 border border-slate-100 hover:border-secondary/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-[#0F9F8F] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="w-28 h-28 rounded-2xl mb-6 overflow-hidden shadow-sm border border-slate-100">
          <img
            src="${universityCardImage(university)}"
            alt="${escapeHtml(university.name)}"
            class="w-full h-full object-cover object-center"
            onerror="this.closest('div').innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-slate-50\'><span class=\'material-symbols-outlined text-5xl text-primary-container/40\'>account_balance</span></div>'"
          />
        </div>
        <h3 class="font-headline-md text-xl text-primary-container mb-1">${escapeHtml(university.name)}</h3>
        <p class="font-body-md text-xs text-on-surface-variant mb-4">${programmeCountText(activeProgrammes.length)}</p>
        <p class="font-body-md text-sm text-secondary font-medium mb-4 flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-sm">location_on</span> ${escapeHtml(university.location || university.city || university.country)}
        </p>
        <a class="w-full border border-surface-container-high bg-surface-container-lowest text-primary-container py-3 rounded-xl font-label-bold text-label-bold hover:bg-primary-container hover:text-white transition-colors mt-auto shadow-sm group-hover:border-primary-container" href="${universityUrl(university)}">View Programmes</a>
      </div>`;
  }

  function renderHomeProgrammeCard(programme) {
    return `
      <div class="bg-white rounded-3xl overflow-hidden shadow-[0px_10px_30px_rgba(11,31,58,0.06)] hover:shadow-[0px_20px_40px_rgba(11,31,58,0.12)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-auto md:h-[560px]">
        <div class="relative h-60">
          <img alt="${escapeHtml(programme.title)}" class="w-full h-full object-cover" src="${programmeImage(programme)}"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
            <span class="font-label-bold text-xs text-[#0B1F3A]">${escapeHtml(titleCase(programme.degree_level))}</span>
          </div>
        </div>
        <div class="p-6 flex flex-col flex-1 relative bg-white">
          <div class="mb-4">
            <h3 class="font-headline-md text-xl text-primary-container leading-tight mb-2 font-bold">${escapeHtml(programme.title)}</h3>
            <p class="font-body-md text-secondary font-medium text-sm">${escapeHtml(programme.university.name)}</p>
            ${renderProgrammeRankingPills(programme)}
          </div>
          <div class="flex items-center gap-4 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-slate-400">location_on</span> ${escapeHtml(programme.university.city || programme.university.location)}</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span> ${yearsFromMonths(programme.duration_months)}</span>
          </div>
          <p class="font-body-md text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed">${escapeHtml(programme.overview || "Contact UKAdmit for detailed course guidance and application support.")}</p>
          <div class="mt-auto grid grid-cols-2 gap-3">
            ${programme.official_course_url
              ? `<a class="border border-slate-300 text-slate-700 py-3 rounded-xl font-label-bold text-xs hover:bg-slate-50 transition-colors text-center flex items-center justify-center gap-1" href="${escapeHtml(programme.official_course_url)}" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[14px]">open_in_new</span>Official Course</a>`
              : `<a class="border border-slate-300 text-slate-700 py-3 rounded-xl font-label-bold text-xs hover:bg-slate-50 transition-colors text-center" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire for Details</a>`}
            <a class="bg-[#0F9F8F] text-white py-3 rounded-xl font-label-bold text-xs hover:bg-[#0d8a7c] transition-colors shadow-md text-center" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire Now</a>
          </div>
        </div>
      </div>`;
  }

  function findSectionByHeading(text) {
    return Array.from(document.querySelectorAll("section")).find((section) => section.textContent.includes(text));
  }

  function renderHomePage() {
    const searchInput = document.querySelector('input[placeholder*="Search programmes"]');
    const searchButton = searchInput?.parentElement?.querySelector("button");
    searchButton?.removeAttribute("onclick");
    searchButton?.addEventListener("click", () => {
      const query = searchInput?.value.trim();
      window.location.href = query ? `programmes.html?search=${encodeURIComponent(query)}` : "programmes.html";
    });

    const floatingUniversityText = Array.from(document.querySelectorAll("p")).find((paragraph) => /^\d+\+? Universit(?:y|ies)$/.test(paragraph.textContent.trim()));
    if (floatingUniversityText) floatingUniversityText.textContent = pluralize(universities.length, "University");

    const universitySection = document.getElementById("home-universities-section") || findSectionByHeading("Universities");
    const universityGrid = universitySection?.querySelector(".grid.grid-cols-1");
    if (universityGrid) universityGrid.innerHTML = universities.slice(0, 4).map(renderHomeUniversityCard).join("");

    const programmeSection = findSectionByHeading("Featured UK Programmes");
    const programmeGrid = programmeSection?.querySelector(".grid.grid-cols-1");
    const featured = programmes.filter((programme) => programme.is_featured).slice(0, 4);
    if (programmeGrid) programmeGrid.innerHTML = (featured.length ? featured : programmes.slice(0, 4)).map(renderHomeProgrammeCard).join("");
  }

  function renderUniversitiesPage() {
    const grid = document.querySelector("main > section.grid");
    if (!grid) return;

    const heroText = document.querySelector("main section:first-of-type p");
    if (heroText) {
      heroText.textContent = `Browse ${pluralize(universities.length, "UK university", "UK universities")} and ${pluralize(programmes.length, "programme")} supported by UKUniAdmissions counsellors.`;
    }

    const searchInput = document.querySelector('input[placeholder*="Search universities"]');
    const chipContainer = document.querySelector("section.mb-section-gap .flex.flex-wrap.justify-center");
    const locations = compactList(universities.flatMap((university) => [university.city, university.location && university.location.split(",").pop()?.trim()]));
    let selectedLocation = "";

    if (chipContainer) {
      chipContainer.innerHTML = ["All Locations", ...locations]
        .map((location, index) => `<button class="px-5 py-2.5 rounded-full ${index === 0 ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface hover:bg-secondary-fixed"} font-label-bold text-label-bold transition-all" data-location="${escapeHtml(index === 0 ? "" : location)}">${escapeHtml(location)}</button>`)
        .join("");
      chipContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-location]");
        if (!button) return;
        selectedLocation = button.dataset.location || "";
        chipContainer.querySelectorAll("button").forEach((chip) => {
          chip.classList.toggle("bg-secondary", chip === button);
          chip.classList.toggle("text-on-secondary", chip === button);
          chip.classList.toggle("bg-surface-container", chip !== button);
          chip.classList.toggle("text-on-surface", chip !== button);
        });
        render();
      });
    }

    function render() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const filtered = universities.filter((university) => {
        const subjects = compactList((university.programmes || []).map((programme) => programme.subject_area)).join(" ");
        const haystack = `${university.name} ${university.city} ${university.location} ${subjects}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesLocation = !selectedLocation || haystack.includes(selectedLocation.toLowerCase());
        return matchesQuery && matchesLocation;
      });
      grid.innerHTML = filtered.length
        ? filtered.map(renderUniversityCard).join("")
        : `<div class="md:col-span-2 lg:col-span-3 text-center bg-surface-container-lowest rounded-xl p-10 border border-outline-variant">No matching universities found.</div>`;
    }

    searchInput?.addEventListener("input", render);
    render();
  }

  function renderProgrammesPage() {
    const grid = Array.from(document.querySelectorAll("div")).find((element) =>
      String(element.className).includes("lg:col-span-3") && String(element.className).includes("grid")
    );
    if (!grid) return;

    const searchInput = document.querySelector('input[placeholder*="Search by course"]');
    const searchButton = searchInput?.parentElement?.querySelector("button");
    const subjectSelect = document.querySelector("aside select");
    const clearButton = Array.from(document.querySelectorAll("aside button")).find((button) => button.textContent.trim().toLowerCase() === "clear all");
    const levelCheckboxes = Array.from(document.querySelectorAll('aside input[type="checkbox"]'));
    const locationContainer = Array.from(document.querySelectorAll("aside .flex.flex-wrap.gap-2")).pop();
    const initialUniversity = getParam("university") || "";
    let selectedLocation = "";
    const PAGE_SIZE = 24;
    let visibleCount = PAGE_SIZE;

    const loadMoreWrapper = document.createElement("div");
    loadMoreWrapper.className = "md:col-span-3 flex flex-col items-center gap-3 pt-4";
    loadMoreWrapper.id = "load-more-wrapper";

    if (searchInput && getParam("search")) {
      searchInput.value = getParam("search");
    }

    if (subjectSelect) {
      subjectSelect.innerHTML = `<option value="">All Subjects</option>` + compactList(programmes.map((programme) => programme.subject_area)).sort()
        .map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`)
        .join("");
    }

    compactList(programmes.map((programme) => programme.degree_level)).forEach((level, index) => {
      const checkbox = levelCheckboxes[index];
      if (!checkbox) return;
      checkbox.checked = true;
      checkbox.value = level;
      const label = checkbox.closest("label")?.querySelector("span:last-child");
      if (label) label.textContent = titleCase(level);
    });

    if (locationContainer) {
      const locations = compactList(universities.flatMap((university) => [university.city, university.location && university.location.split(",").pop()?.trim()]));
      locationContainer.innerHTML = ["All", ...locations]
        .map((location, index) => `<button class="px-4 py-2 rounded-full border ${index === 0 ? "border-secondary bg-secondary-fixed text-on-secondary-fixed" : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary"} font-label-bold text-label-bold text-xs transition-colors" data-location="${escapeHtml(index === 0 ? "" : location)}">${escapeHtml(location)}</button>`)
        .join("");
      locationContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-location]");
        if (!button) return;
        selectedLocation = button.dataset.location || "";
        locationContainer.querySelectorAll("button").forEach((chip) => {
          chip.classList.toggle("border-secondary", chip === button);
          chip.classList.toggle("bg-secondary-fixed", chip === button);
          chip.classList.toggle("text-on-secondary-fixed", chip === button);
          chip.classList.toggle("border-outline-variant", chip !== button);
          chip.classList.toggle("text-on-surface-variant", chip !== button);
        });
        render();
      });
    }

    function render(resetPage = true) {
      if (resetPage) visibleCount = PAGE_SIZE;
      const query = (searchInput?.value || "").trim().toLowerCase();
      const selectedSubject = subjectSelect?.value || "";
      const selectedLevels = new Set(levelCheckboxes.filter((checkbox) => checkbox.checked && checkbox.value).map((checkbox) => checkbox.value));
      const filtered = programmes.filter((programme) => {
        const haystack = `${programme.title} ${programme.subject_area} ${programme.degree_type} ${programme.degree_level} ${programme.university.name} ${programme.university.location}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesSubject = !selectedSubject || programme.subject_area === selectedSubject;
        const matchesLevel = selectedLevels.size === 0 || selectedLevels.has(programme.degree_level);
        const matchesLocation = !selectedLocation || haystack.includes(selectedLocation.toLowerCase());
        const matchesUniversity = !initialUniversity || programme.university.slug === initialUniversity;
        return matchesQuery && matchesSubject && matchesLevel && matchesLocation && matchesUniversity;
      });
      const shown = filtered.slice(0, visibleCount);
      loadMoreWrapper.innerHTML = "";
      if (!filtered.length) {
        grid.innerHTML = `<div class="md:col-span-2 text-center bg-surface-container-lowest rounded-xl p-10 border border-outline-variant">No matching programmes found.</div>`;
        return;
      }
      grid.innerHTML = shown.map(renderProgrammeCard).join("");
      if (filtered.length > visibleCount) {
        const remaining = filtered.length - visibleCount;
        loadMoreWrapper.innerHTML = `
          <p class="font-body-md text-sm text-on-surface-variant">Showing ${visibleCount} of ${filtered.length} programmes</p>
          <button class="px-8 py-3 rounded-xl border-2 border-secondary text-secondary font-label-bold text-label-bold hover:bg-secondary hover:text-on-secondary transition-colors" id="load-more-btn">Load ${Math.min(remaining, PAGE_SIZE)} more</button>`;
        loadMoreWrapper.querySelector("#load-more-btn")?.addEventListener("click", () => {
          visibleCount += PAGE_SIZE;
          render(false);
        });
      } else {
        loadMoreWrapper.innerHTML = `<p class="font-body-md text-sm text-on-surface-variant">Showing all ${filtered.length} programmes</p>`;
      }
      grid.parentElement?.insertBefore(loadMoreWrapper, grid.nextSibling);
    }

    searchInput?.addEventListener("input", render);
    searchButton?.addEventListener("click", (event) => {
      event.preventDefault();
      render();
    });
    subjectSelect?.addEventListener("change", render);
    levelCheckboxes.forEach((checkbox) => checkbox.addEventListener("change", render));
    clearButton?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (subjectSelect) subjectSelect.value = "";
      levelCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      selectedLocation = "";
      render();
    });
    render();
  }

  function renderUniversityDetailPage() {
    const university = universities.find((item) => item.slug === getParam("university")) || universities[0];
    if (!university) return;
    const activeProgrammes = (university.programmes || []).filter((programme) => programme.is_active !== false);
    const subjects = compactList(activeProgrammes.map((programme) => programme.subject_area));
    const studyLevels = compactList(activeProgrammes.map((programme) => titleCase(programme.degree_level))).join(", ");
    const programmeIntro = activeProgrammes.length
      ? `These are the current programmes listed for ${escapeHtml(university.name)}. Use the programme detail page or contact UKAdmit for application guidance.`
      : `Programme listings for ${escapeHtml(university.name)} are being added. Contact UKAdmit for current application guidance and available study options.`;
    const programmeCards = activeProgrammes.length
      ? activeProgrammes.map((programme) => renderProgrammeCard({ ...programme, university })).join("")
      : `<div class="md:col-span-2 lg:col-span-3 bg-surface-container rounded-[24px] p-10 border border-outline-variant text-center">
          <h3 class="font-headline-md text-headline-md text-primary mb-3">Programme details coming soon</h3>
          <p class="font-body-md text-body-md text-on-surface-variant mb-6">Speak with UKAdmit for current course availability, entry guidance, and application support for ${escapeHtml(university.name)}.</p>
          <a class="inline-flex justify-center items-center px-6 py-3 bg-secondary text-on-secondary rounded-xl font-label-bold text-label-bold hover:bg-secondary-container transition-colors" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in studying at ' + university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Enquire Now</a>
        </div>`;
    document.title = `${university.name} - UKAdmit`;
    const main = document.querySelector("main");
    if (!main) return;
    const spacer = main.previousElementSibling;
    if (spacer && spacer.tagName === "DIV" && spacer.getAttribute("style")?.includes("padding-top")) spacer.remove();
    main.className = "";
    main.innerHTML = `
      <section class="relative min-h-[560px] flex items-center bg-surface-container-low overflow-hidden pt-[72px]">
        <div class="absolute inset-0 z-0">
          <img alt="${escapeHtml(university.name)} campus" class="w-full h-full object-cover opacity-80 mix-blend-overlay" src="${universityImage}"/>
          <div class="absolute inset-0 bg-gradient-to-r from-primary-container/90 via-primary-container/75 to-primary-container/20"></div>
        </div>
        <div class="relative z-10 max-w-7xl mx-auto px-8 w-full py-24">
          <div class="max-w-3xl">
            <h1 class="font-display-lg text-display-lg text-on-primary mb-6">${escapeHtml(university.name)}</h1>
            <div class="flex flex-wrap items-center gap-6 mb-10 text-on-primary/85">
              <div class="flex items-center gap-2"><span class="material-symbols-outlined">location_on</span><span class="font-body-lg text-body-lg">${escapeHtml(university.location || university.city || university.country)}</span></div>
              <div class="flex items-center gap-2"><span class="material-symbols-outlined">menu_book</span><span class="font-body-lg text-body-lg">${programmeCountText(activeProgrammes.length)}</span></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
              <a class="bg-teal-400 text-primary-container font-label-bold text-label-bold px-8 py-4 rounded-xl hover:bg-teal-300 transition-colors text-center" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in studying at ' + university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Start Application</a>
              <a class="border-2 border-white/30 text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm text-center" href="programmes.html?university=${encodeURIComponent(university.slug)}">Browse Programmes</a>
            </div>
          </div>
        </div>
      </section>
      <section class="py-16 bg-background">
        <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-surface-container-lowest rounded-[24px] p-8 shadow-[0px_10px_30px_rgba(11,31,58,0.05)]">
            <span class="material-symbols-outlined text-secondary text-4xl mb-4">map</span>
            <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Location</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(university.location || university.city || university.country)}</p>
          </div>
          <div class="bg-surface-container-lowest rounded-[24px] p-8 shadow-[0px_10px_30px_rgba(11,31,58,0.05)]">
            <span class="material-symbols-outlined text-secondary text-4xl mb-4">school</span>
            <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Study Levels</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(studyLevels || "Contact UKAdmit for options")}</p>
          </div>
          <div class="bg-surface-container-lowest rounded-[24px] p-8 shadow-[0px_10px_30px_rgba(11,31,58,0.05)]">
            <span class="material-symbols-outlined text-secondary text-4xl mb-4">category</span>
            <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Study Areas</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">${subjects.length ? pluralize(subjects.length, "subject area") + " available" : "Study areas being updated"}</p>
          </div>
        </div>
      </section>
      <section class="py-16 bg-surface-container-lowest">
        <div class="max-w-7xl mx-auto px-8">
          <div class="max-w-3xl mb-10">
            <h2 class="font-headline-lg text-headline-lg text-primary-container mb-4">Available Programmes</h2>
            <p class="font-body-lg text-body-lg text-on-surface-variant">${programmeIntro}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-element-gap">
            ${programmeCards}
          </div>
        </div>
      </section>`;
  }

  function renderProgrammeDetailPage() {
    const programme = programmes.find((item) => item.slug === getParam("programme")) || programmes.find((item) => item.is_featured) || programmes[0];
    if (!programme) return;
    const related = programmes
      .filter((item) => item.slug !== programme.slug && item.subject_area === programme.subject_area)
      .slice(0, 3);
    document.title = `${programme.title} - ${programme.university.name} | UKAdmit`;
    const main = document.querySelector("main");
    if (!main) return;
    const spacer = main.previousElementSibling;
    if (spacer && spacer.tagName === "DIV" && spacer.getAttribute("style")?.includes("padding-top")) spacer.remove();
    main.className = "";
    main.innerHTML = `
      <section class="relative w-full bg-surface-container-low pt-[120px] pb-20 overflow-hidden">
        <div class="absolute inset-0 z-0 opacity-20">
          <img alt="${escapeHtml(programme.subject_area)} programme" class="w-full h-full object-cover" src="${programmeImage(programme)}"/>
        </div>
        <div class="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
          <div class="flex items-center gap-2 mb-6 font-body-md text-body-md text-on-surface-variant">
            <a class="hover:text-secondary transition-colors" href="programmes.html">Courses</a>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
            <a class="hover:text-secondary transition-colors" href="${universityUrl(programme.university)}">${escapeHtml(programme.university.name)}</a>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
            <span class="text-on-surface font-medium">${escapeHtml(programme.title)}</span>
          </div>
          <h2 class="font-body-lg text-body-lg text-secondary font-medium mb-3">${escapeHtml(programme.university.name)}</h2>
          <h1 class="font-headline-lg text-headline-lg text-primary mb-6 max-w-4xl">${escapeHtml(programme.title)}</h1>
          <div class="flex flex-wrap gap-3 mb-8">
            <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-bold text-label-bold">${escapeHtml(programme.degree_type || titleCase(programme.degree_level))}</span>
            <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-bold text-label-bold"><span class="material-symbols-outlined text-[18px]">schedule</span>${yearsFromMonths(programme.duration_months)} ${escapeHtml(titleCase(programme.study_mode))}</span>
            <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-bold text-label-bold">${escapeHtml(programme.subject_area)}</span>
            <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold text-label-bold"><span class="material-symbols-outlined text-[18px]">language</span>IELTS ${escapeHtml(programme.entry_requirements?.min_ielts || "Varies")}</span>
          </div>
          <p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-8">${escapeHtml(programme.overview || "Contact UKAdmit for detailed course guidance and application support.")}</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a class="inline-flex justify-center items-center px-8 py-4 bg-secondary text-on-secondary rounded-xl font-label-bold text-label-bold hover:bg-secondary-container transition-all shadow-[0px_4px_14px_rgba(30,80,210,0.25)]" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Apply Now via UKAdmit</a>
            ${programme.official_course_url ? `<a class="inline-flex justify-center items-center px-8 py-4 border-2 border-primary text-primary rounded-xl font-label-bold text-label-bold hover:bg-surface-container transition-all" href="${escapeHtml(programme.official_course_url)}" target="_blank" rel="noopener"><span class="material-symbols-outlined mr-2">open_in_new</span>Official Course Page</a>` : ""}
          </div>
        </div>
      </section>
      <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-8 flex flex-col gap-12">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container"><p class="font-body-md text-body-md text-on-surface-variant text-sm">Location</p><p class="font-label-bold text-label-bold text-primary mt-1">${escapeHtml(programme.university.location || programme.university.city)}</p></div>
              <div class="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container"><p class="font-body-md text-body-md text-on-surface-variant text-sm">Study Level</p><p class="font-label-bold text-label-bold text-primary mt-1">${escapeHtml(titleCase(programme.degree_level))}</p></div>
              <div class="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container"><p class="font-body-md text-body-md text-on-surface-variant text-sm">IELTS Required</p><p class="font-label-bold text-label-bold text-primary mt-1">${escapeHtml(programme.entry_requirements?.min_ielts || "Varies")}</p></div>
              <div class="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container"><p class="font-body-md text-body-md text-on-surface-variant text-sm">Subject</p><p class="font-label-bold text-label-bold text-primary mt-1">${escapeHtml(programme.subject_area || "Programme")}</p></div>
            </div>
            <section class="bg-surface-container-lowest rounded-[24px] p-8 md:p-10 shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container">
              <h3 class="font-headline-md text-headline-md text-primary mb-6">Programme Overview</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(programme.overview || "Contact UKAdmit for detailed course guidance and application support.")}</p>
            </section>
            <section class="bg-surface-container-lowest rounded-[24px] p-8 md:p-10 shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container">
              <h3 class="font-headline-md text-headline-md text-primary mb-6">Entry Requirements</h3>
              <div class="space-y-4 font-body-md text-body-md text-on-surface-variant">
                <div class="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-secondary mt-1">school</span><div><p class="font-label-bold text-label-bold text-primary">Academic Requirements</p><p class="mt-1">${escapeHtml(programme.entry_requirements?.min_qualification || "Requirements vary by applicant background.")}</p></div></div>
                <div class="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-secondary mt-1">translate</span><div><p class="font-label-bold text-label-bold text-primary">English Language</p><p class="mt-1">IELTS ${escapeHtml(programme.entry_requirements?.min_ielts || "varies")}${programme.entry_requirements?.ielts_band_min ? ` with no band below ${escapeHtml(programme.entry_requirements.ielts_band_min)}` : ""}.</p></div></div>
              </div>
            </section>
          </div>
          <div class="lg:col-span-4">
            <div class="sticky top-[100px] flex flex-col gap-8">
              <div class="bg-surface-container-lowest rounded-[24px] p-8 shadow-[0px_20px_40px_rgba(11,31,58,0.08)] border border-surface-container relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary-fixed"></div>
                <h3 class="font-headline-md text-headline-md text-primary mb-2">Check Eligibility</h3>
                <p class="font-body-md text-body-md text-on-surface-variant mb-6">Fast-track your application with our expert counsellors.</p>
                <a class="w-full h-[56px] bg-secondary text-on-secondary rounded-xl font-label-bold text-label-bold hover:bg-secondary-container transition-all shadow-md flex items-center justify-center gap-2" href="https://wa.me/94777363079?text=${encodeURIComponent('Hi, I am interested in ' + programme.title + ' at ' + programme.university.name + '. Please contact me.')}" target="_blank" rel="noopener noreferrer">Get Free Consultation<span class="material-symbols-outlined text-[20px]">arrow_forward</span></a>
              </div>
              <div class="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0px_10px_30px_rgba(11,31,58,0.05)] border border-surface-container">
                <h4 class="font-label-bold text-label-bold text-primary mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-secondary">category</span>Similar Programmes</h4>
                <div class="space-y-4">
                  ${related.map((item) => `<a class="group block p-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors" href="${programmeUrl(item)}"><p class="font-label-bold text-label-bold text-on-surface group-hover:text-secondary transition-colors">${escapeHtml(item.title)}</p><p class="font-body-md text-[13px] text-on-surface-variant mt-1">${escapeHtml(item.university.name)}</p></a>`).join("") || `<p class="font-body-md text-body-md text-on-surface-variant">No similar programmes listed yet.</p>`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop().toLowerCase();
    if (page === "" || page === "index.html") renderHomePage();
    if (page === "universities.html") renderUniversitiesPage();
    if (page === "programmes.html") renderProgrammesPage();
    if (page === "university-coventry.html") renderUniversityDetailPage();
    if (page === "bsc-computer-science.html") renderProgrammeDetailPage();
  });
})();
