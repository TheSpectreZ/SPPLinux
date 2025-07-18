class ImageData
{
	constructor(InPath, InData)
    {
        this.path = InPath
		this.data = InData
				
		this.rawimage = new Image(); // Using optional size for image
		this.preview = new Image(64, 64); // Using optional size for image
		this.imageReady = false;

		let that = this;
		
		this.rawimage.onload = function() {
			that.imageReady = true
		}; 
		
		this.rawimage.src = InData;
		
		this.UUID = generate_uuidv4()
    }

	getPath() 
	{
		return this.path
	}	
	
	getPreviewImage() {
		return this.rawimage		
	}
	
	getUUID()
	{
		return this.UUID
	}
}

class ImageProvider
{
    constructor()
    {
        this.images = {}
    }

    addImage(InPath, InData)
    {		
		let newImage = new ImageData(InPath,InData)
		this.images[ newImage.getUUID() ] = newImage
		return newImage.getUUID()
    }
	
	getImage(InUUID) {
		let hasImage = this.images[InUUID]
		if( hasImage != undefined) {
			return hasImage.getPreviewImage()
		}
		return null		
	}
	
	getData(InUUID) {
		return this.images[InUUID]
	}

    getImagePaths()
    {
		
    }

    
}
