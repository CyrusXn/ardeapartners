if(typeof b2brokerOnesignalOptions !== 'undefined') {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(function (OneSignal) {
        OneSignal.init(b2brokerOnesignalOptions);
    });
}

