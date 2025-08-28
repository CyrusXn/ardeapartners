class B2brokerUtmManager {

  static setUtms() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    let date = new Date();

    //90 days windows for utm
    date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
    let expires = "; expires=" + date.toUTCString();

    if(params.get("utm_source") != null)
    document.cookie = "utm_source=" + params.get("utm_source") + expires + "; path=/";

    if(params.get("utm_term") != null)
    document.cookie = "utm_term=" + params.get("utm_term") + expires + "; path=/";

    if(params.get("utm_campaign") != null)
    document.cookie = "utm_campaign=" + params.get("utm_campaign") + expires + "; path=/";

    if(params.get("utm_medium") != null)
    document.cookie = "utm_medium=" + params.get("utm_medium") + expires + "; path=/";

    if(params.get("utm_content") != null)
    document.cookie = "utm_content=" + params.get("utm_content") + expires + "; path=/";

  }

}
B2brokerUtmManager.setUtms();
