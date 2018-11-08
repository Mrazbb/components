COMPONENT('scrollpercentage', function(self, config) {

	var container;

	self.readonly();
	self.nocompile && self.nocompile();

	self.make = function() {
		if (self.element[0].tagName === 'BODY') {
			$(window).on('scroll', self.refresh);
			container = document.documentElement;
		} else
			container = self.element.on('scroll', self.refresh)[0];
		self.refresh();
	};

	self.refresh = function() {
		var t = container;
		var pos = t.scrollTop;
		var h = t.scrollHeight;
		var p = (pos / (h - t.clientHeight)) * 100;
		if (config.exec)
			EXEC(config.exec, p, container);
		else
			SET(self.path, p, 2);
	};

	self.setter = function(value, path, type) {
		type && type !== 2 && (container.scrollTop = ((container.scrollHeight - container.clientHeight) / 100) * value);
	};
});