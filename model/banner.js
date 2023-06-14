import mongoose from "mongoose";


const BannerSchema=mongoose.Schema({  
  
    bannerPic:{
        type:String
    },

    description:{
        type:String
    }

})

const Banner = mongoose.model('Banner', BannerSchema);
export default Banner;