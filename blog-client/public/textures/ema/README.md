# Ema material sources

The production wood uses **White Maple Veneer**, photographed PBR material from
[Poly Haven](https://polyhaven.com/a/white_maple_veneer), downloaded 2026-10-28.
[License: CC0](https://polyhaven.com/license), including commercial use and redistribution.

- maple-color.jpg: original 1K Diffuse JPEG (sRGB)
- maple-normal.jpg: original 1K OpenGL normal JPEG (linear data)
- maple-roughness.jpg: original 1K Rough JPEG (linear data)

Maps are deployed locally. No runtime dependency on Poly Haven's servers.

Implementation references:
- https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber
  Rope constraints between particles + spherical joint to freely rotating badge.
  Our Vue/Three implementation uses a closed three-ply tube around the nail and
  through the drilled hole rather than the example's flat MeshLine.
- https://rapier.rs/docs/user_guides/javascript/joints/
- https://threejs.org/manual/#color-management
  Color maps use SRGBColorSpace; normal and roughness use NoColorSpace.
- https://threejs.org/docs/#TubeGeometry
  Curve frames orient the circular cross sections of the three helical strands.
