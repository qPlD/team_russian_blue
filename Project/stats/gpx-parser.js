var gpxParser = function () {
    this.xmlSource = "";
    this.metadata = {};
    this.tracks = [];
};

gpxParser.prototype.parse = function (string) {
    var keepThis = this;
    var domParser = new DOMParser();
    this.xmlSource = domParser.parseFromString(string, 'text/xml');

    metadata = this.xmlSource.querySelector('metadata');
    if(metadata != null){
        this.metadata.name  = this.getElementValue(metadata, "name");
        this.metadata.desc  = this.getElementValue(metadata, "desc");
        this.metadata.time  = this.getElementValue(metadata, "time");

        let author = {};
        let authorElem = metadata.querySelector('author');
        if(authorElem != null){
            author.name = this.getElementValue(authorElem, "name");

            author.email         = {};
            let emailElem        = authorElem.querySelector('email');
            if(emailElem != null){
                author.email.id      = emailElem.getAttribute("id");
                author.email.domain  = emailElem.getAttribute("domain");
            }

            let link     = {};
            let linkElem = authorElem.querySelector('link');
            if(linkElem != null){
                link.href    = linkElem.getAttribute('href');
                link.text    = this.getElementValue(linkElem, "text");
                link.type    = this.getElementValue(linkElem, "type");
            }
            author.link = link;
        }
        this.metadata.author = author;

        let link = {};
        let linkElem = metadata.querySelector('link');
        if(linkElem != null){
            link.href = linkElem.getAttribute('href');
            link.text = this.getElementValue(linkElem, "text");
            link.type = this.getElementValue(linkElem, "type");
            this.metadata.link = link;
        }
    }

    var trks = [].slice.call(this.xmlSource.querySelectorAll('trk'));
    for (let idx in trks){
        var trk = trks[idx];
        let track = {};

        track.name   = keepThis.getElementValue(trk, "name");
        track.cmt    = keepThis.getElementValue(trk, "cmt");
	//track.time   = keepThis.getElementValue(trk, "time");		
        track.desc   = keepThis.getElementValue(trk, "desc");
        track.src    = keepThis.getElementValue(trk, "src");
        track.number = keepThis.getElementValue(trk, "number");
        track.link   = keepThis.getElementValue(trk, "link");
        track.type   = keepThis.getElementValue(trk, "type");

        let trackpoints = [];
        var trkpts = [].slice.call(trk.querySelectorAll('trkpt'));
	    for (let idxIn in trkpts){
            var trkpt = trkpts[idxIn];
            let pt = {};
            pt.lat = parseFloat(trkpt.getAttribute("lat"));
            pt.lon = parseFloat(trkpt.getAttribute("lon"));
            pt.ele = parseFloat(keepThis.getElementValue(trkpt, "ele"));
            trackpoints.push(pt);
        }
        track.distance = keepThis.calculDistance(trackpoints);
	//track.time = keepThis.calculTime(trackpoints);////////////////////
        track.elevation = keepThis.calcElevation(trackpoints);
        track.points = trackpoints;
        keepThis.tracks.push(track);
		console.log(keepThis.tracks)
    }
};

gpxParser.prototype.getElementValue = function(parent, needle){
    let elem = parent.querySelector(" :scope > " + needle);
    if(elem != null){
            return elem.innerHTML;
    }
    return elem;
}

gpxParser.prototype.calculDistance = function(points) {
    let distance = {};
    let totalDistance = 0;
    let cumulDistance = [];
    for (var i = 0; i < points.length - 1; i++) {
        totalDistance += this.calcDistanceBetween(points[i],points[i+1]);
        cumulDistance[i] = totalDistance;
    }
    cumulDistance[points.length - 1] = totalDistance;

    distance.total = totalDistance;
    distance.cumul = cumulDistance;

    return distance;
}

gpxParser.prototype.calculTime = function(points) {

    timems = 0;
    var startDate = new Date(points[0].getElementByTagName("time")[0].textContent);
    var endDate = new Date(points[points.length-1].getElementByTagName("time")[points.length-1].textContent);
    
    

    return timems;
}

gpxParser.prototype.calcDistanceBetween = function (wpt1, wpt2) {
    let latlng1 = {};
    latlng1.lat = wpt1.lat;
    latlng1.lon = wpt1.lon;
    let latlng2 = {};
    latlng2.lat = wpt2.lat;
    latlng2.lon = wpt2.lon;
    var rad = Math.PI / 180,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
		    sinDLon = Math.sin((latlng2.lon - latlng1.lon) * rad / 2),
		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return 6371000 * c;
}


gpxParser.prototype.calcElevation = function (points) {
    var dp = 0,
        dm = 0,
        ret = {};

    for (var i = 0; i < points.length - 1; i++) {
        var diff = parseFloat(points[i + 1].ele) - parseFloat(points[i].ele);

        if (diff < 0) {
            dm += diff;
        } else if (diff > 0) {
            dp += diff;
        }
    }

    var elevation = [];
    var sum = 0;

    for (var i = 0, len = points.length; i < len; i++) {
        var ele = parseFloat(points[i].ele);
        elevation.push(ele);
        sum += ele;
    }

    ret.max = Math.max.apply(null, elevation);
    ret.min = Math.min.apply(null, elevation);
    ret.pos = Math.abs(dp);
    ret.neg = Math.abs(dm);
    ret.avg = sum / elevation.length;

    return ret;
};

gpxParser.prototype.isEmpty = function (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};
