export const multerOptions = {
    // limits: {
    //     fileSize: 3000,
    // },
    fileFilter: (req: any, file: any, cb: any) => {
      if (
        !file.mimetype.startsWith('image/') &&
        !file.mimetype.startsWith('video/') &&
        !file.mimetype.startsWith('audio/')
      ) {
        cb(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST
          ),
          false
        );
      } else {
        cb(null, true);
      }
    },
    storage: remoteStorage,
  };
  