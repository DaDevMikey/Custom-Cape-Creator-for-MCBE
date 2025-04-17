# Custom-Cape-Creator-for-MCBE
Create custom capes with our pre made addon for your Minecraft Bedrock edition game!

# Custom Capes Creator

A simple web tool to help create custom cape packs (as `.mcpack` files) using an uploaded image.

## How it Works

This tool takes an image you upload and integrates it into a pre-defined template pack structure.

1.  **Upload:** You choose an image file using the front-end interface.
2.  **Processing (Backend):**
    * The uploaded image is renamed to `elytra.png`.
    * It's placed into the correct directory within a template resource pack (`textures/models/armor/`).
    * The `manifest.json` file is updated with necessary details like unique IDs (UUIDs) and pack information.
    * The entire template pack folder is then compressed into a `.zip` archive.
    * Finally, the `.zip` file extension is changed to `.mcpack`.
3.  **Download:** You can download the resulting `.mcpack` file.

## Template Pack Structure

The tool utilizes a template pack structure similar to this:

```
piz-cape-example/ <-- based of https://github.com/noah-ah23/cape-example/
├── animations/
├── entity/
├── models/
│   ├── armor/
│   │   └── elytra.png  <-- Your uploaded image goes here
│   └── entity/
├── render_controllers/
├── textures/
├── manifest.json       <-- Edited by the backend
└── pack_icon.png
```

## License

This project is licensed under the MIT License.
