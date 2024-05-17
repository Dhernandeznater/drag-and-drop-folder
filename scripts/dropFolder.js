Hooks.on('dropCanvasData', (canvas, data) => {
    const parsedData = game.folders.get(parseUuid(data.uuid).documentId)
    if (!(parsedData instanceof Folder)) {
        return;
    }

    // TODO(Add support for compendium folders)
    let folderContent = parsedData.contents;
    let xModifier = 0;

    folderContent.forEach((actor) => {
        if (!game.user.can("TOKEN_CREATE")) {
            ui.notifications.warn("You don't have permission to create new Tokens!");
        }

        if (!actor.isOwner) {
            ui.notifications.warn(`You are not an owner for the Actor ${actor.name}.`);
        }


        const tokenDocPromise =
            actor.getTokenDocument(
                { x: data.x, y: data.y, hidden: game.user.isGM && game.keyboard.isModifierActive(KeyboardManager.MODIFIER_KEYS.ALT) });

        tokenDocPromise.then((tokenDoc) => {
            const halfWidth = canvas.grid.w / 2;
            const halfHeight = canvas.grid.h / 2;
            let snappedPosition =
                canvas.grid.getSnappedPosition(
                    tokenDoc.x - (tokenDoc.width * halfWidth), tokenDoc.y - (tokenDoc.height * halfHeight));
            snappedPosition = canvas.grid.grid.shiftPosition(snappedPosition.x, snappedPosition.y, xModifier, 0);

            tokenDoc.updateSource({ x: snappedPosition.at(0), y: snappedPosition.at(1) });

            if (canvas.dimensions.rect.contains(tokenDoc.x + xModifier, tokenDoc.y)) {
                canvas.tokens.activate();
                tokenDoc.constructor.create(tokenDoc, { parent: canvas.scene });
            }
            xModifier += 1;
        });
    });
});