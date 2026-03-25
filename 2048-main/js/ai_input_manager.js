function AiInputManager(gm) {
  this.game = gm;
  this.events = {};
  this.interval = null;

  this.updateInterval();
  $("#interval").change(this.updateInterval.bind(this));
  this.listen();
}

AiInputManager.prototype.updateInterval = function () {
    var val = parseInt($("#interval").val(), 10);
    if (isNaN(val) || val < 0) {
        this.delay = 500;
        $("#interval").val(this.delay);
    } else {
        this.delay = val;
    }
    this.startLoop();
};

AiInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

AiInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

AiInputManager.prototype.step = function() {
  if (typeof Ai === 'undefined') return;
  if (this.ai == null) {
    this.ai = new Ai();
    if (this.ai.init != null) this.ai.init();
  }
  var suggestion = this.ai.stepExplainable(this.game.grid.copy());
  this.emit("move", suggestion.move);
};

AiInputManager.prototype.printCounts = function() {
  if (typeof Ai === 'undefined') return;
  this.ai.printCounts();
}

AiInputManager.prototype.moveToString = function (direction) {
  if (direction == 0) {
    return "up";
  }
  if (direction == 1) {
    return "right";
  }
  if (direction == 2) {
    return "down";
  }
  if (direction == 3) {
    return "left";
  }
}

AiInputManager.prototype.startLoop = function() {
  if (this.interval != null) {
    clearInterval(this.interval);
  }
  if (this.delay > 0) {
    this.interval = setInterval(this.step.bind(this), this.delay);
  }
}

AiInputManager.prototype.listen = function () {
  this.startLoop();

  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener("touchend", this.restart.bind(this));
};

AiInputManager.prototype.restart = function (event) {
  event.preventDefault();
  if (this.ai != null && this.ai.restart != null) {
    this.ai.restart();
  }
  this.emit("restart");
};
