COMPONENT('enter', 'validate:1;trigger:button[name="submit"];flags:visible;timeout:1500', function(self, config) {

	var flags;

	self.readonly();
	self.make = function() {
		self.event('keydown', 'input', function(e) {
			if (e.which === 13 && (!config.validate || CAN(self.path, flags))) {
				if (config.exec) {
					if (!BLOCKED(self.ID, config.timeout))
						EXEC(self.makepath(config.exec), self);
				} else {
					var btn = self.find(config.trigger);
					if (!btn.prop('disabled')) {
						if (!BLOCKED(self.ID, config.timeout))
							btn.trigger('click');
					}
				}
			}
		});
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'flags':
				if (value) {
					flags = value.split(',');
					for (var i = 0; i < flags.length; i++)
						flags[i] = '@' + flags[i];
				} else
					flags = null;
				break;
		}
	};

});