import { Response } from "express";
import { z } from "zod";

export function handleError(res: Response, error: any) {
    if(error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        
        const errors = Object.keys(fieldErrors).reduce((prev, curr) => {
            const str = fieldErrors[curr]?.reduce((prev, curr) => prev + " " + curr , "")

            return {...prev, [curr]: str?.trim()}
        }, {})

        res.status(400).json({message: "validation error",  ...errors});
    }
    else if(error.code == 11000) {
        console.log("Duplicate Error", error.keyPattern);
        
        const duplicateFields = Object.keys(error.keyPattern).reduce((prev, curr) => {
            return {...prev, [curr]: `Specified ${curr.split(".").join(" ")} already exists`}
        }, {})

        res.status(400).json({message: "Duplicate Error", ...duplicateFields});
    }
    else {
        console.log(error);
        
        res.status(500).json({message: "something went wrong, please try again later"});
    }
}