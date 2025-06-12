class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        this.load.setPath("./assets/kenney_rpg-audio/Audio");
        this.load.audio("confirm", "drawKnife3.ogg");
    }

    create() {
        this.title = this.add.text(game.config.width/2, game.config.height/2 - 200,
            "Path Protector",
            {
                fontFamily: 'Times, Serif',
                fontSize: 90
            }
        )
        this.title.setOrigin(0.5);

        this.infoText = this.add.text(game.config.width/2, game.config.height/2 + 120,
            "Welcome to Path Protector!\nYour goal is to keep the enemies from getting to the end.\n\nThere will be three waves of enemies.\n\nPress 'C' to begin.",
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
            this.scene.start("load");
        }
    }
}