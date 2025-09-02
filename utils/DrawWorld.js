// Taken From RenderLib because i dont like external dependencies

const lineDisk = new org.lwjgl.util.glu.Disk();
lineDisk.drawStyle = org.lwjgl.util.glu.GLU.GLU_LINE;

const regDisk = new org.lwjgl.util.glu.Disk();

export default class Drawable {
    static drawBox = (x, y, z, w, h, red, green, blue, alpha, phase) => {
        Tessellator.pushMatrix();
        GL11.glLineWidth(2.0);
        GlStateManager.func_179129_p(); // disableCullFace
        GlStateManager.func_179147_l(); // enableBlend
        GlStateManager.func_179112_b(770, 771); // blendFunc
        GlStateManager.func_179132_a(false); // depthMask
        GlStateManager.func_179090_x(); // disableTexture2D

        if (phase) {
            GlStateManager.func_179097_i() // disableDepth
        }

        const locations = [
            //    x, y, z    x, y, z
            [
                [0, 0, 0],
                [w, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, w],
            ],
            [
                [w, 0, w],
                [w, 0, 0],
            ],
            [
                [w, 0, w],
                [0, 0, w],
            ],

            [
                [0, h, 0],
                [w, h, 0],
            ],
            [
                [0, h, 0],
                [0, h, w],
            ],
            [
                [w, h, w],
                [w, h, 0],
            ],
            [
                [w, h, w],
                [0, h, w],
            ],

            [
                [0, 0, 0],
                [0, h, 0],
            ],
            [
                [w, 0, 0],
                [w, h, 0],
            ],
            [
                [0, 0, w],
                [0, h, w],
            ],
            [
                [w, 0, w],
                [w, h, w],
            ],
        ];

        locations.forEach((loc) => {
            Tessellator.begin(3).colorize(red, green, blue, alpha);

            Tessellator.pos(x + loc[0][0] - w / 2, y + loc[0][1], z + loc[0][2] - w / 2).tex(0, 0);

            Tessellator.pos(x + loc[1][0] - w / 2, y + loc[1][1], z + loc[1][2] - w / 2).tex(0, 0);

            Tessellator.draw();
        });

        GlStateManager.func_179089_o(); // enableCull
        GlStateManager.func_179084_k(); // disableBlend
        GlStateManager.func_179132_a(true); // depthMask
        GlStateManager.func_179098_w(); // enableTexture2D

        if (phase) {
            GlStateManager.func_179126_j(); // enableDepth
        }

        Tessellator.popMatrix();
    };

    static drawDisk = (x, y, z, radius, slices, loops, rot1, rot2, rot3, r, g, b, a, phase) => {
        let renderPos = Tessellator.getRenderPos(x, y, z);
        x = renderPos.x;
        y = renderPos.y;
        z = renderPos.z;

        Tessellator.pushMatrix();
        GL11.glLineWidth(2.0);
        GlStateManager.func_179129_p(); // disableCullFace
        GlStateManager.func_179147_l(); // enableBlend
        GlStateManager.func_179112_b(770, 771); // blendFunc
        GlStateManager.func_179132_a(false); // depthMask
        GlStateManager.func_179090_x(); // disableTexture2D

        if (phase) {
            GlStateManager.func_179097_i() // disableDepth
        }

        Tessellator.colorize(r, g, b, a);
        Tessellator.translate(x, y, z);
        Tessellator.rotate(90, 1, 0, 0);

        regDisk.draw(radius-0.01, radius, slices, loops);


        GlStateManager.func_179089_o(); // enableCull
        GlStateManager.func_179084_k(); // disableBlend
        GlStateManager.func_179132_a(true); // depthMask
        GlStateManager.func_179098_w(); // enableTexture2D
        if (phase) {
            GlStateManager.func_179126_j(); // enableDepth
        }

        Tessellator.popMatrix();
    };
}