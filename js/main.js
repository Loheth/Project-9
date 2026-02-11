var Main = function(game){

};

var score = 0;

Main.prototype = {

	create: function() {

		this.tileVelocity = -450;
		this.rate = 1500;
		score = 0;

		var tileImg = this.game.cache.getImage('tile');
		this.tileWidth = 64;
		this.tileHeight = 64;
		this.tileScaleX = this.tileWidth / tileImg.width;
		this.tileScaleY = this.tileHeight / tileImg.height;
		this.boxScale = 0.28;
		this.boxHeight = this.game.cache.getImage('box').height * this.boxScale;

		this.game.stage.backgroundColor = '479cde';

		this.bg = this.game.add.sprite(0, 0, 'bg');
		this.bg.width = this.game.world.width;
		this.bg.height = this.game.world.height;

		this.bgOverlay = this.game.add.graphics(0, 0);
		this.bgOverlay.beginFill(0x000000, 0.45);
		this.bgOverlay.drawRect(0, 0, this.game.world.width, this.game.world.height);
		this.bgOverlay.endFill();

		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.floor = this.game.add.group();
		this.floor.enableBody = true;
		this.floor.createMultiple(Math.ceil(this.game.world.width / this.tileWidth), 'tile');
		this.floor.forEach(function(t) {
			t.scale.setTo(this.tileScaleX, this.tileScaleY);
			t.body.setSize(this.tileWidth, this.tileHeight);
		}, this);

		this.boxes = this.game.add.group();
		this.boxes.enableBody = true;
		this.boxes.createMultiple(20, 'box');
		var boxW = this.game.cache.getImage('box').width * this.boxScale;
		var boxH = this.game.cache.getImage('box').height * this.boxScale;
		this.boxes.forEach(function(b) {
			b.scale.setTo(this.boxScale, this.boxScale);
			b.body.setSize(boxW, boxH);
		}, this);
		this.game.world.bringToTop(this.floor);

		this.jumping = false;

		this.addBase();
		this.createScore();
		this.createPlayer();
		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.timer = game.time.events.loop(this.rate, this.addObstacles, this);
		this.Scoretimer = game.time.events.loop(100, this.incrementScore, this);

	},

	update: function() {

		this.syncPlayerGlow();

		this.game.physics.arcade.collide(this.player, this.floor);
		this.game.physics.arcade.collide(this.player, this.boxes, this.gameOver, null, this);

		var onTheGround = this.player.body.touching.down;

		if (onTheGround) {
			this.jumps = 2;
			this.jumping = false;
		}

		if (this.jumps > 0 && this.upInputIsActive(5)) {
			this.player.body.velocity.y = -1000;
			this.jumping = true;
		}

		if (this.jumping && this.upInputReleased()) {
			this.jumps--;
			this.jumping = false;
		}

	},

	addBox: function (x, y) {

		var tile = this.boxes.getFirstDead();

		tile.reset(x, y);
		tile.body.velocity.x = this.tileVelocity;
		tile.body.immovable = true;
		tile.checkWorldBounds = true;
		tile.outOfBoundsKill = true;
	},

	addObstacles: function () {
		var tilesNeeded = Math.floor( Math.random() * (5 - 0));
		if (this.rate > 200) {
			this.rate -= 10;
			this.tileVelocity = -(675000 / this.rate);

		}

		for (var i = 0; i < tilesNeeded; i++) {

			this.addBox(this.game.world.width , this.game.world.height -
				this.tileHeight - ((i + 1)* this.boxHeight ));

		}
	},

	addTile: function (x, y) {

		var tile = this.floor.getFirstDead();

		tile.reset(x, y);
		tile.body.immovable = true;
		tile.checkWorldBounds = true;
		tile.outOfBoundsKill = true;
	},

	addBase: function () {
		var tilesNeeded = Math.ceil(this.game.world.width / this.tileWidth);
		var y = (this.game.world.height - this.tileHeight);

		for (var i = 0; i < tilesNeeded; i++) {

			this.addTile(i * this.tileWidth, y);

		}
	},

	upInputIsActive: function (duration) {
		var isActive = false;

		isActive = this.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
		isActive |= (this.game.input.activePointer.justPressed(duration + 1000 / 60) &&
			this.game.input.activePointer.x > this.game.width / 4 &&
			this.game.input.activePointer.x < this.game.width / 2 + this.game.width / 4);

		return isActive;
	},

	upInputReleased: function () {
		var released = false;

		released = this.input.keyboard.upDuration(Phaser.Keyboard.UP);
		released |= this.game.input.activePointer.justReleased();

		return released;
	},

	createPlayer: function () {

		var playerX = this.game.world.width / 5;
		var playerY = this.game.world.height - (this.tileHeight * 2);

		// Cyber neon: inner magenta glow + outer cyan outline
		var innerOffset = 1;
		var outerOffset = 2;
		var innerOffsets = [
			[innerOffset, 0], [-innerOffset, 0], [0, innerOffset], [0, -innerOffset],
			[innerOffset, innerOffset], [-innerOffset, innerOffset],
			[innerOffset, -innerOffset], [-innerOffset, -innerOffset]
		];
		var outerOffsets = [
			[outerOffset, 0], [-outerOffset, 0], [0, outerOffset], [0, -outerOffset],
			[outerOffset, outerOffset], [-outerOffset, outerOffset],
			[outerOffset, -outerOffset], [-outerOffset, -outerOffset]
		];
		this.playerOutlineSprites = [];
		// Outer cyan glow (drawn first, so it sits behind)
		for (var j = 0; j < outerOffsets.length; j++) {
			var s2 = this.game.add.sprite(playerX + outerOffsets[j][0], playerY + outerOffsets[j][1], 'player');
			s2.anchor.setTo(0.5, 1.0);
			s2.scale.setTo(4, 4);
			s2.tint = 0x00E5FF; // cyber neon cyan
			s2.alpha = 1;
			this.playerOutlineSprites.push({ sprite: s2, dx: outerOffsets[j][0], dy: outerOffsets[j][1] });
		}
		// Inner magenta glow
		for (var i = 0; i < innerOffsets.length; i++) {
			var s = this.game.add.sprite(playerX + innerOffsets[i][0], playerY + innerOffsets[i][1], 'player');
			s.anchor.setTo(0.5, 1.0);
			s.scale.setTo(4, 4);
			s.tint = 0xFF00FF; // cyber magenta
			s.alpha = 0.7;
			this.playerOutlineSprites.push({ sprite: s, dx: innerOffsets[i][0], dy: innerOffsets[i][1] });
		}

		this.player = this.game.add.sprite(playerX, playerY, 'player');
		this.player.scale.setTo(4, 4);
		this.player.anchor.setTo(0.5, 1.0);
		this.player.tint = 0x88CCFF; // cyber blue-silver tint
		this.game.physics.arcade.enable(this.player);
		this.player.body.gravity.y = 2200;
		this.player.body.collideWorldBounds = true;
		this.player.body.bounce.y = 0.1;
		this.player.body.drag.x = 150;
		var walk = this.player.animations.add('walk');
		this.player.animations.play('walk', 20, true);
		this.game.world.bringToTop(this.player);
	},

	syncPlayerGlow: function () {
		if (!this.playerOutlineSprites) return;
		for (var i = 0; i < this.playerOutlineSprites.length; i++) {
			var o = this.playerOutlineSprites[i];
			o.sprite.x = this.player.x + o.dx;
			o.sprite.y = this.player.y + o.dy;
			o.sprite.frame = this.player.frame;
		}
	},

	createScore: function () {

		var scoreFont = "70px 'Press Start 2P'";
		var neonCyan = "#00E5FF";
		var shadowBlur = 32;

		this.scoreLabel = this.game.add.text(this.game.world.centerX, 70, "0", {
			font: scoreFont,
			fill: neonCyan,
			align: "center"
		});
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.scoreLabel.setShadow(0, 0, neonCyan, shadowBlur);
		this.game.world.bringToTop(this.scoreLabel);
	},

	incrementScore: function () {

		score += 1;
		this.scoreLabel.setText(score);
		this.game.world.bringToTop(this.scoreLabel);
	},

	gameOver: function(){
		this.game.state.start('GameOver');
	}

};
