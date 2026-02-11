var GameOver = function(game){};

GameOver.prototype = {

	create: function(){
		var w = this.game.world.width;
		var h = this.game.world.height;

		// End screen background image (scale to cover)
		var endBg = this.game.add.image(w / 2, h / 2, 'endBg');
		endBg.anchor.setTo(0.5, 0.5);
		var scaleX = w / endBg.width;
		var scaleY = h / endBg.height;
		endBg.scale.setTo(Math.max(scaleX, scaleY));
		this.game.world.sendToBack(endBg);

		this.quit = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.resume = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.showScore();
		this.drawBottomIcons(w, h);
	},

	showScore: function () {
		var w = this.game.world.width;
		var h = this.game.world.height;
		var cx = this.game.world.centerX;
		var cy = this.game.world.centerY;
		var margin = 48;
		var designW = 760;
		var designH = 400;
		// Scale panel to fit world so text never gets cut off
		var scale = Math.min(
			(w - margin * 2) / designW,
			(h - margin * 2) / designH,
			1
		);
		scale = Math.max(scale, 0.4);
		var panelW = Math.round(designW * scale);
		var panelH = Math.round(designH * scale);
		var panelX = cx - panelW / 2;
		var panelY = cy - panelH / 2;
		var radius = Math.max(12, Math.round(32 * scale));
		var cyan = 0x00E5FF;
		var neonCyan = "#00E5FF";

		// Proportional positions (0–1 within panel height)
		var rel = function (fraction) { return panelY + fraction * panelH; };

		// —— Box: dark interior (slightly lighter than background)
		var panel = this.game.add.graphics(0, 0);
		panel.beginFill(0x0d0d1a, 0.92);
		if (panel.drawRoundedRect) {
			panel.drawRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, radius - 3);
		} else {
			panel.drawRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6);
		}
		panel.endFill();
		this.game.world.bringToTop(panel);

		// —— Outer glow halo
		var glow = this.game.add.graphics(0, 0);
		if (glow.drawRoundedRect) {
			glow.lineStyle(24, cyan, 0.06);
			glow.drawRoundedRect(panelX - 16, panelY - 16, panelW + 32, panelH + 32, radius + 16);
			glow.lineStyle(12, cyan, 0.14);
			glow.drawRoundedRect(panelX - 8, panelY - 8, panelW + 16, panelH + 16, radius + 8);
			glow.lineStyle(6, cyan, 0.3);
			glow.drawRoundedRect(panelX - 4, panelY - 4, panelW + 8, panelH + 8, radius + 4);
		}
		glow.lineStyle(3, cyan, 0.85);
		if (glow.drawRoundedRect) {
			glow.drawRoundedRect(panelX, panelY, panelW, panelH, radius);
		} else {
			glow.drawRect(panelX, panelY, panelW, panelH);
		}
		this.game.world.bringToTop(glow);

		// —— Scanline-style border (fine horizontal lines for digital trace look)
		var scan = this.game.add.graphics(0, 0);
		scan.lineStyle(1, cyan, 0.5);
		var step = Math.max(2, Math.floor(panelW / 200));
		for (var s = 0; s < panelW; s += step) {
			scan.moveTo(panelX + s, panelY);
			scan.lineTo(panelX + Math.min(s + 1, panelW), panelY);
			scan.moveTo(panelX + s, panelY + panelH);
			scan.lineTo(panelX + Math.min(s + 1, panelW), panelY + panelH);
		}
		for (var sy = 0; sy < panelH; sy += step) {
			scan.moveTo(panelX, panelY + sy);
			scan.lineTo(panelX, panelY + Math.min(sy + 1, panelH));
			scan.moveTo(panelX + panelW, panelY + sy);
			scan.lineTo(panelX + panelW, panelY + Math.min(sy + 1, panelH));
		}
		this.game.world.bringToTop(scan);

		var titleSize = Math.max(24, Math.round(72 * scale));
		var scoreSize = Math.max(14, Math.round(32 * scale));
		var hintSize = Math.max(12, Math.round(24 * scale));
		var titleFont = titleSize + "px 'Press Start 2P'";
		var scoreFont = scoreSize + "px 'Press Start 2P'";
		var hintFont = hintSize + "px 'Press Start 2P'";
		var textWhite = "#f0f0f0";
		var shadowBlur = Math.max(8, Math.round(32 * scale));

		// —— GAME OVER: largest, bold, with pronounced glitch + glow
		this.titleLabel = this.game.add.text(cx, rel(0.17), "GAME OVER", {
			font: titleFont,
			fill: neonCyan,
			align: "center"
		});
		this.titleLabel.anchor.setTo(0.5, 0.5);
		this.titleLabel.setShadow(0, 0, neonCyan, shadowBlur);
		this.game.world.bringToTop(this.titleLabel);

		// Glitch layer 1 (offset + slight magenta shift)
		this.titleGlitch = this.game.add.text(cx - 3, rel(0.178), "GAME OVER", {
			font: titleFont,
			fill: "#FF66DD",
			align: "center"
		});
		this.titleGlitch.anchor.setTo(0.5, 0.5);
		this.titleGlitch.alpha = 0.35;
		this.game.world.bringToTop(this.titleGlitch);

		// Glitch layer 2 (offset + cyan, horizontal disruption)
		this.titleGlitch2 = this.game.add.text(cx + 4, rel(0.163), "GAME OVER", {
			font: titleFont,
			fill: neonCyan,
			align: "center"
		});
		this.titleGlitch2.anchor.setTo(0.5, 0.5);
		this.titleGlitch2.alpha = 0.4;
		this.game.world.bringToTop(this.titleGlitch2);

		// —— Scores: label and number together (no gap)
		this.hs = window.localStorage.getItem('HighScore');
		if (this.hs == null) {
			window.localStorage.setItem('HighScore', score);
			this.hs = String(score);
		} else if (parseInt(this.hs, 10) < score) {
			window.localStorage.setItem('HighScore', score);
			this.hs = String(score);
		}

		this.scoreLabel = this.game.add.text(cx, rel(0.42), "YOUR SCORE: " + score, {
			font: scoreFont,
			fill: textWhite,
			align: "center"
		});
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.scoreLabel);

		this.highScore = this.game.add.text(cx, rel(0.58), "BEST SCORE: " + this.hs, {
			font: scoreFont,
			fill: textWhite,
			align: "center"
		});
		this.highScore.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.highScore);

		// —— Retry: slightly smaller than score, clean white, no glow
		this.restart = this.game.add.text(cx, rel(0.87), "PRESS SPACE BAR TO RETRY", {
			font: hintFont,
			fill: textWhite,
			align: "center"
		});
		this.restart.anchor.setTo(0.5, 0.5);
		this.game.world.bringToTop(this.restart);
	},

	drawBottomIcons: function(w, h) {
		var g = this.game.add.graphics(0, 0);
		var cyan = 0x00E5FF;
		var iconY = h - 32;
		var spacing = w / 7;
		var startX = spacing;

		// Simple pixel-style icons (tank, explosion, flame, blob, tank, star)
		for (var i = 0; i < 6; i++) {
			var x = startX + i * spacing;
			g.lineStyle(1, cyan, 0.8);
			g.beginFill(cyan, 0.4);
			if (i === 0 || i === 4) {
				g.drawRect(x - 8, iconY - 6, 16, 10);
				g.drawRect(x - 10, iconY + 2, 6, 4);
				g.drawRect(x + 4, iconY + 2, 6, 4);
			} else if (i === 1 || i === 5) {
				g.drawRect(x - 2, iconY - 6, 4, 12);
				g.drawRect(x - 6, iconY - 2, 12, 4);
				g.drawRect(x - 4, iconY - 4, 2, 2);
				g.drawRect(x + 2, iconY - 4, 2, 2);
				g.drawRect(x - 4, iconY + 2, 2, 2);
				g.drawRect(x + 2, iconY + 2, 2, 2);
			} else if (i === 2) {
				g.drawRect(x - 2, iconY - 8, 4, 4);
				g.drawRect(x - 4, iconY - 4, 8, 6);
				g.drawRect(x - 2, iconY + 2, 4, 4);
			} else {
				g.drawRect(x - 4, iconY - 4, 4, 4);
				g.drawRect(x + 2, iconY - 2, 4, 4);
				g.drawRect(x - 2, iconY + 2, 6, 4);
			}
			g.endFill();
		}
		this.game.world.bringToTop(g);
	},

	update: function () {
		if (this.resume.isDown) {
			this.restartGame();
		}
		// Dynamic glitch: horizontal disruptions and slight misalignments on GAME OVER
		if (this.titleLabel) {
			if (this.titleGlitch) {
				this.titleGlitch.x = this.titleLabel.x + (Math.random() * 8 - 6);
				this.titleGlitch.y = this.titleLabel.y + (Math.random() * 4 - 2);
			}
			if (this.titleGlitch2) {
				this.titleGlitch2.x = this.titleLabel.x + (Math.random() * 6 - 4);
				this.titleGlitch2.y = this.titleLabel.y + (Math.random() * 3 - 2);
			}
		}
	},

	restartGame: function(){
		this.game.state.start("Main");
	}
};
