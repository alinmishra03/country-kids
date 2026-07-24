/* The card mesh — a rounded, bevelled slab built once and SHARED by every card
   on the globe (24 meshes, 1 geometry).

   Why an ExtrudeGeometry rather than a plane with alpha-cut corners:
     · the corners are real geometry, so they never fight the depth buffer the
       way an alpha-tested plane does;
     · the bevel gives the edge a highlight to catch, which is what sells the
       "glass slab" look under the environment lights;
     · it produces two material GROUPS — face and edge — so the photo material
       and the glass-edge material are separate without a second mesh.

   ExtrudeGeometry's default UVs come out in shape space (world x/y), so the
   face UVs are remapped to a clean 0–1 rect afterwards. Group 1 (the sides) is
   left alone: its material has no map. */

import * as THREE from 'three';

export function createCardGeometry(
    width: number,
    height: number,
    depth: number,
    radius: number
) {
    const shape = roundedRectShape(width, height, radius);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth * 0.7,
        bevelEnabled: true,
        bevelThickness: depth * 0.15,
        bevelSize: depth * 0.15,
        bevelOffset: 0,
        bevelSegments: 2,
        curveSegments: 8,
    });

    /* Extrude builds forward from z = 0; recentre so the card's own origin is
       its middle — billboarding and the hover "push toward camera" both assume
       that. */
    geometry.center();
    remapFaceUVs(geometry, width, height);
    geometry.computeVertexNormals();

    return geometry;
}

/* A rounded rectangle centred on the origin. */
function roundedRectShape(w: number, h: number, r: number) {
    const x = -w / 2;
    const y = -h / 2;
    /* A radius larger than half the short edge would self-intersect. */
    const rad = Math.min(r, Math.min(w, h) / 2);

    const shape = new THREE.Shape();
    shape.moveTo(x + rad, y);
    shape.lineTo(x + w - rad, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + rad);
    shape.lineTo(x + w, y + h - rad);
    shape.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    shape.lineTo(x + rad, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - rad);
    shape.lineTo(x, y + rad);
    shape.quadraticCurveTo(x, y, x + rad, y);
    shape.closePath();

    return shape;
}

/* Rewrite every UV from shape space into 0–1 across the card's face. The side
   walls get nonsense UVs out of this, which is fine — they render with the
   untextured edge material. */
function remapFaceUVs(geometry: THREE.ExtrudeGeometry, width: number, height: number) {
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < uv.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uv.setXY(i, (x + width / 2) / width, (y + height / 2) / height);
    }
    uv.needsUpdate = true;
}
