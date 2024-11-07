import sharp from "sharp";

const processImages = async (req, _, next) => {
  try {
    const images = req.files;

    if (!images) return next();

    const processedImages = await Promise.all(
      images.map(async (image) => {
        const processedBuffer = await sharp(image.buffer)
          .resize({ width: 800, height: 800, fit: sharp.fit.cover })
          .toFormat("jpeg", { quality: 80 })
          .toBuffer();

        return {
          originalname: image.originalname,
          buffer: processedBuffer,
          mimetype: "image/jpeg",
        };
      })
    );

    req.files = processedImages;

    next();
  } catch (error) {
    next(error);
  }
};

export default processImages;
