class Win extends Phaser.Scene {
    constructor() {
        super("win");
    }

    preload() {
        this.load.setPath("./assets/kenney_rpg-audio/Audio");
        this.load.audio("confirm", "drawKnife3.ogg");
    }

    create() {
        this.title = this.add.text(game.config.width/2, game.config.height/2 - 200,
            "You win!!",
            {
                fontFamily: 'Times, Serif',
                fontSize: 90
            }
        )
        this.title.setOrigin(0.5);

        this.infoText = this.add.text(game.config.width/2, game.config.height/2 + 120,
            "You have kept the enemies at bay!\nCongratulations!\n\nPress 'C' to go back to the menu.",
            {
                fontSize: 40
            }
        )
        this.infoText.setOrigin(0.5);

        this.C = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); // C key
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.C)) {
            this.sound.play("confirm", {volume: 0.5});
            this.scene.start("menu");
        }
    }
}