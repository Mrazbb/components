COMPONENT('map', function(self, config) {

	// TODO: more makers (array), methods for add maker, remove maker, change maker animation
	self.readonly();
	self.nocompile && self.nocompile();

	self.prepare = function(lat, lng) {

		lat = lat.toString();
		lng = lng.toString();

		var max = function(val, num) {
			var index = val.indexOf('.');
			return index === -1 ? val : val.substring(0, index + 1 + num);
		};

		return max(lat, 6) + ',' + max(lng, 6);
	};

	self.make = function() {
		WAIT('google', function() {
			var animations = { drop: google.maps.Animation.DROP, bounce: google.maps.Animation.BOUNCE };
			var options = {};

			options.zoom = config.zoom || 13;
			options.scrollwheel = true;
			options.streetViewControl = false;
			options.mapTypeId = config.type || 'roadmap';

			self.map = new google.maps.Map(self.element[0], options);
			self.geo = new google.maps.Geocoder();

			options = { position: self.map.getCenter(), map: self.map };
			options.draggable = config.draggable || false;

			if (config.animation)
				options.animation = animations[config.animation];

			if (config.icon)
				options.icon = config.icon;

			self.marker = new google.maps.Marker(options);

			google.maps.event.addListener(self.marker, 'click', function(e) {
				var fn = config.click;
				fn && self.get(fn)(self.prepare(e.latLng.lat(), e.latLng.lng()));
			});

			if (!options.draggable)
				return;

			google.maps.event.addListener(self.marker, 'dragend', function(e) {
				self.set(self.prepare(e.latLng.lat(), e.latLng.lng()));
			});
		});
	};

	self.search = function(lat, lng) {

		if (lng !== undefined) {
			var position = new google.maps.LatLng(lat, lng);
			self.map.setCenter(position);
			self.marker.setPosition(position);
			return self;
		}

		self.geo.geocode({ 'address': lat, 'partialmatch': true }, function(response, status) {
			if (status !== 'OK' || !response.length)
				return;
			var result = response[0].geometry;
			self.map.fitBounds(result.viewport);
			self.marker.setPosition(result.location);
		});

		return self;
	};

	self.reset = function(lat, lng) {

		google.maps.event.trigger(self.map, 'resize');

		if(lng !== undefined){
			var position = new google.maps.LatLng(lat, lng);
			self.map.setCenter(position);
		}

		return self;
	};

	self.setter = function(value) {

		if (!value)
			return;

		if (!value.replace(/\s/g, '').match(/^[0-9.,]+(,|;)?[0-9.,]+$/)) {
			self.search(value);
			return;
		}

		value = value.replace(/\s/g, '');

		var index = value.indexOf(';');
		if (index === -1)
			index = value.indexOf(',');
		if (index === -1)
			return;
		var lat = value.substring(0, index).parseFloat();
		var lng = value.substring(index + 1).parseFloat();
		self.search(lat, lng);
	};
}, ['https://maps.googleapis.com/maps/api/js?key=AIzaSyDRRKKSG8td8bT-W_rkuLtZCKiTlS_iIX8 .js']);
