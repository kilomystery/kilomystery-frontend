(function () {
  window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;

  window.kmApplyConsent =
    window.kmApplyConsent ||
    function (choice) {
      window.__kmPendingConsentChoice =
        typeof choice === "string" ? choice : null;
    };

  window.__kmStubLoaded = true;
})();
