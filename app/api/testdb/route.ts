import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req:NextRequest){
    const cookieStore:any = await cookies();
    const supabase = createClient(cookieStore);

    const {data: allProjects, error } = await supabase. from ('projects')
        .select(`*`);

    if (error){
        console.log("Error fetching all projects: ", error);
        return NextResponse.json({error: error.message}, {status:500});
    }
    return NextResponse.json(allProjects);

}