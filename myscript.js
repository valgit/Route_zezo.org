"use strict";

const pattern = /updi\(event,'([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}) ([A-Z]{3,4}).*(T[+-]{1}.*?[0-9]{1,}:[0-9]{2}).*<br>Distances:.*?([0-9]{1,}\.[0-9]{1,}nm)\/([0-9]{1,}\.[0-9]{1,}nm)<br><b>Wind:<\/b> ([0-9]*?.*) (.*? kt).*\(<b>TWA(.*?)<\/b>\)<br><b>Heading:<\/b>(.*?)<b>Sail:<\/b>(.*?)<br><b>Boat Speed:<\/b>(.*?)'/g
const points = [];

function getLatitude(top, scale) {
    return 90 - ((top + 2) / scale);
}

function getLongitude(left, scale) {
    if (((left + 2 / scale) >= -180) || ((left + 2 / scale) <= 180)) {
        return (left + 2) / scale;
    } else {
        return ((left + 2) / scale) - 360;
    }
}

try {
    let scale;
    for (const script of document.scripts) {
        if (script.textContent.includes("var scale")) {
            scale = /var scale = ([0-9]{1,3})/.exec(script.textContent)[1];
            break;
        }
    }
    let layer = document.getElementById("dot_layer");
    Array.prototype.slice.call(layer.getElementsByTagName("img")).forEach(function (element) {
        let event = element.getAttribute("onmouseover");
        if (event !== null) {
            let style = element.getAttribute("style"),
                cssProperties = style.split(";"),
                left = parseInt(cssProperties[1].split(":")[1].replace("px", ""), 10),
                top = parseInt(cssProperties[2].split(":")[1].replace("px", ""), 10),
                match = pattern.exec(event);
            const date = match[1],
                time = match[2],
                timezone = match[3],
                ttw = match[4],
                dtw = match[5],
                dtg = match[6],
                twd = match[7],
                tws = match[8],
                twa = match[9],
                btw = match[10],
                sail = match[11],
                stw = match[12];
            let race = document.title;
            points.push({
                race: race,
                longitude: getLongitude(left, scale),
                latitude: getLatitude(top, scale),
                date: date,
                time: time,
                timezone: timezone,
                ttw: ttw,
                dtw: dtw,
                dtg: dtg,
                twd: twd,
                tws: tws,
                twa: twa,
                btw: btw,
                sail: sail,
                stw: stw
            });
            pattern.lastIndex = 0;
        }
    });
    chrome.runtime.sendMessage(points);
} catch (e) {
    console.error(e);
    chrome.runtime.sendMessage([]);
}
