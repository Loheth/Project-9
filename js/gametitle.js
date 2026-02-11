var GameTitle = function(game){};

GameTitle.prototype = {

	create: function(){
		var w = this.game.width;
		var h = this.game.height;
		var bg = this.game.add.image(w / 2, h / 2, 'titleScreen');
		bg.anchor.setTo(0.5, 0.5);
		var scaleX = w / bg.width;
		var scaleY = h / bg.height;
		bg.scale.setTo(Math.max(scaleX, scaleY));

		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.spaceKey.onDown.add(this.startGame, this);
	},

	startGame: function(){
		this.game.state.start("Main");
	}

}