var GameOver = function(game){};

GameOver.prototype = {

	create: function(){
		this.background = this.game.add.sprite(0, 0, 'background');
		this.background.width = this.game.world.width;
		this.background.height = this.game.world.height;
		this.game.world.sendToBack(this.background);

		this.quit = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.resume = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.showScore();
	},

	update: function () {
		if (this.resume.isDown) {
			this.restartGame();
		}
		if (this.quit.isDown) {
		}
	},

	showScore: function () {
		var cx = this.game.world.centerX;
		var cy = this.game.world.centerY;
		var panelW = Math.min(520, this.game.world.width - 80);
		var panelH = 280;
		var panelX = cx - panelW / 2;
		var panelY = cy - panelH / 2;

		// Neon panel: dark fill + glowing cyan border (match title screen)
		var panel = this.game.add.graphics(0, 0);
		panel.lineStyle(4, 0x00E5FF, 0.5);
		panel.drawRect(panelX - 2, panelY - 2, panelW + 4, panelH + 4);
		panel.lineStyle(2, 0x00E5FF, 1);
		panel.drawRect(panelX, panelY, panelW, panelH);
		panel.beginFill(0x0a0a1a, 0.85);
		panel.drawRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4);
		panel.endFill();
		this.game.world.bringToTop(panel);

		// Pixel / Minecraft-style font (Press Start 2P)
		var titleFont = "24px 'Press Start 2P'";
		var scoreFont = "16px 'Press Start 2P'";
		var hintFont = "12px 'Press Start 2P'";
		var neonCyan = "#00E5FF";

		// GAME OVER title
		this.titleLabel = this.game.add.text(cx, panelY + 42, "GAME OVER", {
			font: titleFont,
			fill: neonCyan,
			align: "center"
		});
		this.titleLabel.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.titleLabel);

		// Score line
		this.scoreLabel = this.game.add.text(cx, panelY + 100, "SCORE: " + score, {
			font: scoreFont,
			fill: neonCyan,
			align: "center"
		});
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.scoreLabel);

		// High score
		this.hs = window.localStorage.getItem('HighScore');
		if (this.hs == null) {
			window.localStorage.setItem('HighScore', score);
			this.hs = String(score);
		} else if (parseInt(this.hs, 10) < score) {
			window.localStorage.setItem('HighScore', score);
			this.hs = String(score);
		}
		this.highScore = this.game.add.text(cx, panelY + 140, "BEST: " + this.hs, {
			font: scoreFont,
			fill: neonCyan,
			align: "center"
		});
		this.highScore.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.highScore);

		// Retry hint
		this.restart = this.game.add.text(cx, panelY + panelH - 48, "PRESS SPACE TO RETRY", {
			font: hintFont,
			fill: neonCyan,
			align: "center"
		});
		this.restart.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.restart);
	},

	restartGame: function(){
		this.game.state.start("Main");
	}
};