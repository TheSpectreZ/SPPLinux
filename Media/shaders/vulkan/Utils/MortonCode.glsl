
const uint64_t magicbit3D_masks64_encode[6] =
{
    0x1fffffUL,
    0x1f00000000ffffUL,
    0x1f0000ff0000ffUL,
    0x100f00f00f00f00fUL,
    0x10c30c30c30c30c3UL,
    0x1249249249249249UL
};

const uint64_t magicbit3D_masks64_decode[6] =
{
    0x1fffffUL,
    0x1f00000000ffffUL,
    0x1f0000ff0000ffUL,
    0x100f00f00f00f00fUL,
    0x10c30c30c30c30c3UL,
    0x1249249249249249UL
};


uint32_t getBy3(uint64_t m)
{
    uint64_t x = m & 0x1249249249249249UL;
    x = (x ^ (x >> 2)) & 0x10c30c30c30c30c3UL;
    x = (x ^ (x >> 4)) & 0x100f00f00f00f00fUL;
    x = (x ^ (x >> 8)) & 0x1f0000ff0000ffUL;
    x = (x ^ (x >> 16)) & 0x1f00000000ffffUL;
    x = (x ^ (x >> 32)) & 0x1fffffUL;
    return uint32_t(x);
}

uint64_t splitBy3(uint32_t a)
{
    uint64_t x = a & 0x1fffffUL;
    x = (x | x << 32) & 0x1f00000000ffffUL;
    x = (x | x << 16) & 0x1f0000ff0000ffUL;
    x = (x | x << 8) & 0x100f00f00f00f00fUL;
    x = (x | x << 4) & 0x10c30c30c30c30c3UL;
    x = (x | x << 2) & 0x1249249249249249UL;
    return x;
}

ivec3 morton_decode(uint64_t InMortonCode)
{
    return ivec3( 
        int(getBy3(InMortonCode)),
        int(getBy3(InMortonCode >> 1)),
        int(getBy3(InMortonCode >> 2) ));
}

uint64_t morton_encode(in ivec3 InCoord)
{
    return splitBy3(InCoord[0]) | splitBy3(InCoord[1]) << 1 | splitBy3(InCoord[2]) << 2;
}