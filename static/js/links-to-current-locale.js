class Links_To_Current_Locale {

    static host = location.protocol + "//" + location.host;

    static process_links() {
        const domain = location.host;
        const links = document.querySelectorAll(`a[href^="/"]:not(.internal_links_checked),.site-content a[href*="${domain}"]:not(.internal_links_checked):not([href*=".${domain}"])`);
        for (var i = 0; i < links.length; i++) {
            let linkHref = links[i].getAttribute('href');
            links[i].classList.add('internal_links_checked');
            for (const prefix of ltclActiveLangs) {
                linkHref = linkHref.replace(new RegExp(`/${prefix}/`, 'g'), '/');
            }
            if (linkHref.includes("app/uploads")) continue;
            const domainWithLang = `${domain}/${ltclLang}`;
            if (linkHref.indexOf(domain) >= 0 && linkHref.indexOf(domainWithLang) <= 0) {
                linkHref = linkHref.replace(domain, domainWithLang);
                links[i].setAttribute('href', linkHref);
            } else if (linkHref.indexOf('//') !== 0 && linkHref.indexOf(`/${ltclLang}`) < 0) {
                links[i].setAttribute('href', ltclLangBase + linkHref);
            }
        }
    }

}

$ = jQuery;

$(document).ready(function () {
    if (!ltclLang && !ltclLangBase) {
        return;
    }
    if (ltclLang == ltclDefLang) return;

    $(window).one('scroll mousemove touchstart', function () {
        Links_To_Current_Locale.process_links();

        setInterval(function () {
            Links_To_Current_Locale.process_links();
        }, 5000);
    });
});
