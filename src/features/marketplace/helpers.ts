// Helper function to get a unique, specific emoji based on category name
export const getCategoryEmoji = (categoryName: string): string => {
    const name = categoryName.toLowerCase();

    // Home Improvement & Maintenance
    if (name.includes("plumber")) return "🪠";
    if (name.includes("electrician")) return "⚡";
    if (name.includes("hvac") || name.includes("air conditioning")) return "❄️";
    if (name.includes("handyman")) return "🛠️";
    if (name.includes("painter") || name.includes("painting")) return "🖌️";
    if (name.includes("roofer") || name.includes("roofing")) return "🏠";
    if (name.includes("carpenter")) return "🪵";
    if (name.includes("locksmith")) return "🔑";
    if (name.includes("pest control") || name.includes("exterminator")) return "🪳";
    if (name.includes("appliance repair")) return "🔌";
    if (name.includes("masonry") || name.includes("mason")) return "🧱";
    if (name.includes("flooring")) return "🪜";
    if (name.includes("tile setter") || name.includes("tile")) return "🔲";
    if (name.includes("drywall")) return "📏";
    if (name.includes("insulation")) return "🧦";
    if (name.includes("foundation")) return "🏛️";
    if (name.includes("water damage")) return "🌊";
    if (name.includes("fire damage")) return "🔥";
    if (name.includes("mold")) return "🍄";
    if (name.includes("cabinet")) return "🪟";
    if (name.includes("glass installer") || name.includes("glassblower") || name.includes("glass blower")) return "🪞";
    if (name.includes("garage door")) return "🚪";
    if (name.includes("awning")) return "⛱️";
    if (name.includes("gutter")) return "🚿";
    if (name.includes("chimney")) return "🏭";
    if (name.includes("pool")) return "🏊";
    if (name.includes("hot tub")) return "♨️";
    if (name.includes("septic")) return "🚽";
    if (name.includes("well pump")) return "🚰";
    if (name.includes("solar")) return "☀️";
    if (name.includes("security installer")) return "🚨";
    if (name.includes("smart home") || name.includes("integrator")) return "🤖";
    if (name.includes("home inspector")) return "📋";
    if (name.includes("energy auditor")) return "📊";
    if (name.includes("draftsman")) return "📐";
    if (name.includes("architect")) return "🏛️";
    if (name.includes("structural engineer")) return "🏗️";
    if (name.includes("surveyor")) return "🗺️";

    // Cleaning Services
    if (name.includes("house cleaner")) return "🧼";
    if (name.includes("office cleaner")) return "🧹";
    if (name.includes("deep cleaning") || name.includes("deep cleaner")) return "✨";
    if (name.includes("carpet cleaner") || name.includes("carpet cleaning")) return "🧽";
    if (name.includes("window cleaner") || name.includes("window cleaning")) return "🪟";
    if (name.includes("power washer") || name.includes("power washing")) return "💦";
    if (name.includes("gutter cleaner") || name.includes("gutter cleaning")) return "🍂";
    if (name.includes("janitorial") || name.includes("janitor")) return "🪣";
    if (name.includes("post-construction")) return "🚧";
    if (name.includes("move-in/move-out") || name.includes("move cleaner")) return "📦";
    if (name.includes("air duct")) return "💨";
    if (name.includes("upholstery cleaner") || name.includes("upholstery cleaning")) return "🛋️";
    if (name.includes("tile and grout")) return "🧽";
    if (name.includes("blind cleaner") || name.includes("blind cleaning")) return "🪟";
    if (name.includes("chandelier")) return "💡";
    if (name.includes("odor removal")) return "🌬️";
    if (name.includes("hoarding") || name.includes("hoard")) return "🗑️";
    if (name.includes("crime scene")) return "⚠️";
    if (name.includes("biohazard")) return "☣️";
    if (name.includes("trash bin") || name.includes("trash cleaner")) return "🚮";

    // Automotive & Vehicle
    if (name.includes("mobile mechanic") || name.includes("mechanic")) return "🚗";
    if (name.includes("auto detailer") || name.includes("detailing")) return "🧽";
    if (name.includes("towing") || name.includes("tow")) return "🛞";
    if (name.includes("tire repair") || name.includes("tire")) return "🛞";
    if (name.includes("windshield")) return "🪞";
    if (name.includes("motorcycle")) return "🏍️";
    if (name.includes("boat maintenance") || name.includes("boat repair")) return "⛵";
    if (name.includes("rv repair") || name.includes("rv maintenance")) return "🚐";
    if (name.includes("bicycle") || name.includes("bike")) return "🚲";
    if (name.includes("locksmith (auto)") || name.includes("car locksmith")) return "🔑";
    if (name.includes("battery jump") || name.includes("car battery")) return "🔋";
    if (name.includes("dent repair") || name.includes("paintless dent")) return "🔨";
    if (name.includes("car audio") || name.includes("stereo")) return "🔊";
    if (name.includes("vinyl wrap")) return "🎨";
    if (name.includes("auto upholstery")) return "🪑";
    if (name.includes("truck mechanic") || name.includes("truck repair")) return "🚚";
    if (name.includes("heavy equipment") || name.includes("heavy repair")) return "🚜";
    if (name.includes("forklift")) return "🚜";
    if (name.includes("golf cart")) return "⛳";
    if (name.includes("scooter")) return "🛵";
    if (name.includes("fleet")) return "🏢";

    // Landscaping & Outdoors
    if (name.includes("lawn care") || name.includes("lawn mown") || name.includes("mowing")) return "🌱";
    if (name.includes("gardener") || name.includes("gardening")) return "🧑‍🌾";
    if (name.includes("tree trimmer") || name.includes("tree trimming")) return "🪓";
    if (name.includes("arborist")) return "🌳";
    if (name.includes("snow removal") || name.includes("snow plow")) return "❄️";
    if (name.includes("hardscaper") || name.includes("hardscaping")) return "🪨";
    if (name.includes("fence") || name.includes("fencing")) return "🚧";
    if (name.includes("sprinkler")) return "💦";
    if (name.includes("landscape designer") || name.includes("landscaping")) return "🎨";
    if (name.includes("weed control")) return "🌿";
    if (name.includes("aeration") || name.includes("lawn aeration")) return "🚜";
    if (name.includes("stump grinding") || name.includes("stump remover")) return "🪵";
    if (name.includes("pond")) return "🐠";
    if (name.includes("deck builder") || name.includes("decking")) return "🔨";
    if (name.includes("patio")) return "🧱";
    if (name.includes("retaining wall")) return "🧱";
    if (name.includes("outdoor lighting")) return "🔦";
    if (name.includes("gazebo")) return "🛖";
    if (name.includes("shed")) return "🏚️";
    if (name.includes("greenhouse")) return "🏡";
    if (name.includes("soil testing")) return "🧪";

    // Moving & Delivery
    if (name.includes("local mover")) return "🚛";
    if (name.includes("long distance")) return "🚚";
    if (name.includes("furniture assembler") || name.includes("assembler")) return "🪑";
    if (name.includes("junk") || name.includes("waste removal")) return "🗑️";
    if (name.includes("courier")) return "🛵";
    if (name.includes("grocery")) return "🥦";
    if (name.includes("packing")) return "📦";
    if (name.includes("piano mover")) return "🎹";
    if (name.includes("appliance delivery")) return "🔌";
    if (name.includes("art & antique") || name.includes("antique mover")) return "🖼️";
    if (name.includes("dumpster")) return "🚛";
    if (name.includes("freight")) return "🚢";
    if (name.includes("medical courier")) return "🏥";
    if (name.includes("legal courier")) return "⚖️";
    if (name.includes("food delivery") || name.includes("food courier")) return "🍕";
    if (name.includes("package delivery")) return "📦";
    if (name.includes("vehicle transport")) return "🚗";
    if (name.includes("boat transport")) return "⚓";
    if (name.includes("motorcycle transport")) return "🚛";
    if (name.includes("pet transport")) return "🐕";

    // Tech & IT Services
    if (name.includes("computer repair") || name.includes("pc repair")) return "💻";
    if (name.includes("network installer") || name.includes("network setup")) return "🌐";
    if (name.includes("tv mounter") || name.includes("tv mounting")) return "📺";
    if (name.includes("phone repair") || name.includes("mobile repair")) return "📱";
    if (name.includes("data recovery")) return "💾";
    if (name.includes("it consultant") || name.includes("tech consultant")) return "🧠";
    if (name.includes("cybersecurity") || name.includes("security analyst")) return "🔐";
    if (name.includes("software developer") || name.includes("software engineer")) return "⌨️";
    if (name.includes("web developer") || name.includes("web design")) return "🌐";
    if (name.includes("database")) return "🗄️";
    if (name.includes("cloud")) return "☁️";
    if (name.includes("devops")) return "♾️";
    if (name.includes("system administrator") || name.includes("sysadmin")) return "🖥️";
    if (name.includes("tech support") || name.includes("helpdesk")) return "📞";
    if (name.includes("wi-fi") || name.includes("wifi")) return "📶";
    if (name.includes("server")) return "🗄️";
    if (name.includes("pos system") || name.includes("pos installer")) return "💸";
    if (name.includes("cable technician")) return "🔌";
    if (name.includes("printer")) return "🖨️";
    if (name.includes("game console")) return "🎮";
    if (name.includes("drone")) return "🛸";
    if (name.includes("3d printing") || name.includes("3d print")) return "🖨️";

    // Beauty, Health & Wellness
    if (name.includes("hair stylist") || name.includes("haircut") || name.includes("hairdresser")) return "✂️";
    if (name.includes("makeup artist") || name.includes("makeup")) return "💄";
    if (name.includes("nail technician") || name.includes("manicure") || name.includes("pedicure")) return "💅";
    if (name.includes("massage") || name.includes("masseur")) return "💆";
    if (name.includes("barber")) return "💈";
    if (name.includes("personal trainer") || name.includes("fitness coach")) return "🏋️";
    if (name.includes("yoga")) return "🧘";
    if (name.includes("pilates")) return "🤸";
    if (name.includes("dietitian")) return "🥗";
    if (name.includes("nutritionist")) return "🍎";
    if (name.includes("acupuncturist")) return "🪡";
    if (name.includes("chiropractor")) return "🦴";
    if (name.includes("physical therapist")) return "🏃";
    if (name.includes("occupational")) return "🧑‍🦽";
    if (name.includes("speech")) return "🗣️";
    if (name.includes("life coach")) return "🎯";
    if (name.includes("health coach")) return "🍏";
    if (name.includes("mental health") || name.includes("counselor") || name.includes("therapist")) return "💬";
    if (name.includes("tattoo")) return "✒️";
    if (name.includes("piercing")) return "💎";
    if (name.includes("esthetician")) return "🧴";
    if (name.includes("lash")) return "👁️";
    if (name.includes("threader") || name.includes("threading")) return "🧵";
    if (name.includes("waxing")) return "🍯";
    if (name.includes("tanning")) return "🧴";
    if (name.includes("color consultant")) return "🎨";
    if (name.includes("wardrobe") || name.includes("stylist")) return "🧥";

    // Events & Entertainment
    if (name.includes("dj") || name.includes("disc jockey")) return "🎧";
    if (name.includes("photographer") || name.includes("photography")) return "📸";
    if (name.includes("videographer") || name.includes("videography")) return "📹";
    if (name.includes("event planner") || name.includes("party planner")) return "📅";
    if (name.includes("caterer") || name.includes("catering") || name.includes("cater")) return "🍽️";
    if (name.includes("chef") || name.includes("cook") || name.includes("cooking")) return "🧑‍🍳";
    if (name.includes("bartender")) return "🍹";
    if (name.includes("florist") || name.includes("flowers")) return "💐";
    if (name.includes("band/musician") || name.includes("singer") || name.includes("musician")) return "🎸";
    if (name.includes("photo booth")) return "🖼️";
    if (name.includes("event security")) return "🛡️";
    if (name.includes("valet")) return "🔑";
    if (name.includes("party equipment") || name.includes("tent rental")) return "🎪";
    if (name.includes("magician")) return "🪄";
    if (name.includes("clown")) return "🤡";
    if (name.includes("face painter") || name.includes("face painting")) return "🎨";
    if (name.includes("balloon")) return "🎈";
    if (name.includes("caricature")) return "🎨";
    if (name.includes("master of ceremonies") || name.includes("mc")) return "🎤";
    if (name.includes("event decorator") || name.includes("party decorator")) return "🎀";
    if (name.includes("lighting tech") || name.includes("lighting designer")) return "💡";
    if (name.includes("sound engineer") || name.includes("audio engineer")) return "🎛️";
    if (name.includes("stagehand")) return "🏗️";
    if (name.includes("special fx") || name.includes("sfx")) return "🎭";

    // Education & Tutoring
    if (name.includes("math") || name.includes("mathematics")) return "➕";
    if (name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")) return "🔬";
    if (name.includes("language") || name.includes("english") || name.includes("spanish") || name.includes("french")) return "🗣️";
    if (name.includes("test prep") || name.includes("exam prep")) return "📝";
    if (name.includes("music teacher") || name.includes("piano teacher") || name.includes("guitar teacher")) return "🎹";
    if (name.includes("art instructor") || name.includes("art teacher")) return "🎨";
    if (name.includes("driving")) return "🚦";
    if (name.includes("dance") || name.includes("dancing")) return "💃";
    if (name.includes("martial arts") || name.includes("karate") || name.includes("judo")) return "🥋";
    if (name.includes("swim") || name.includes("swimming")) return "🏊";
    if (name.includes("chess")) return "♟️";
    if (name.includes("computer skills")) return "💻";
    if (name.includes("reading")) return "📚";
    if (name.includes("writing tutor") || name.includes("essay help")) return "✍️";
    if (name.includes("special education")) return "🤝";
    if (name.includes("sign language")) return "👋";
    if (name.includes("acting")) return "🎭";
    if (name.includes("vocal") || name.includes("singing coach")) return "🎤";
    if (name.includes("public speaking")) return "🎤";
    if (name.includes("sewing instructor")) return "🧵";

    // Financial & Legal
    if (name.includes("tax")) return "💵";
    if (name.includes("bookkeeper") || name.includes("bookkeeping")) return "🗒️";
    if (name.includes("notary")) return "🖋️";
    if (name.includes("legal") || name.includes("lawyer") || name.includes("attorney")) return "⚖️";
    if (name.includes("financial")) return "📈";
    if (name.includes("insurance")) return "📜";
    if (name.includes("accountant")) return "📊";
    if (name.includes("payroll")) return "💸";
    if (name.includes("credit repair")) return "💳";
    if (name.includes("debt")) return "📉";
    if (name.includes("estate")) return "📜";
    if (name.includes("paralegal")) return "📁";
    if (name.includes("process server")) return "✉️";
    if (name.includes("private investigator")) return "🕵️";
    if (name.includes("mediator") || name.includes("mediation")) return "🤝";
    if (name.includes("grant writer")) return "✍️";
    if (name.includes("business broker")) return "💼";
    if (name.includes("real estate appraiser") || name.includes("appraiser")) return "🔍";
    if (name.includes("mortgage")) return "🏦";
    if (name.includes("title searcher")) return "📜";
    if (name.includes("bail bondsman")) return "⛓️";

    // Writing, Translation & Creative
    if (name.includes("copywriter") || name.includes("copywriting")) return "✍️";
    if (name.includes("proofreader") || name.includes("proofreading")) return "🔍";
    if (name.includes("translator") || name.includes("translation")) return "🌐";
    if (name.includes("resume")) return "📄";
    if (name.includes("graphic designer") || name.includes("graphic design")) return "🎨";
    if (name.includes("web designer") || name.includes("web design")) return "💻";
    if (name.includes("interior designer") || name.includes("interior design")) return "🛋️";
    if (name.includes("voice actor") || name.includes("voiceover")) return "🎙️";
    if (name.includes("editor") || name.includes("editing")) return "📝";
    if (name.includes("technical writer")) return "📖";
    if (name.includes("ghostwriter")) return "👻";
    if (name.includes("blogger") || name.includes("blogging")) return "✍️";
    if (name.includes("content creator")) return "🤳";
    if (name.includes("seo")) return "📈";
    if (name.includes("illustrator") || name.includes("illustration")) return "🎨";
    if (name.includes("animator") || name.includes("animation")) return "🎬";
    if (name.includes("video editor") || name.includes("video editing")) return "🎬";
    if (name.includes("audio editor") || name.includes("audio editing")) return "🎧";
    if (name.includes("podcast")) return "🎙️";
    if (name.includes("music producer")) return "🎛️";
    if (name.includes("storyboard")) return "🗒️";
    if (name.includes("3d modeler") || name.includes("3d modeling")) return "🕶️";
    if (name.includes("ux/ui") || name.includes("ui/ux")) return "💻";

    // Business & Administrative
    if (name.includes("virtual assistant")) return "🧑‍💻";
    if (name.includes("customer support") || name.includes("customer service")) return "🎧";
    if (name.includes("data entry")) return "⌨️";
    if (name.includes("social media")) return "📣";
    if (name.includes("project manager") || name.includes("pm")) return "📋";
    if (name.includes("hr consultant") || name.includes("human resources")) return "🤝";
    if (name.includes("recruiter") || name.includes("recruitment")) return "🔍";
    if (name.includes("business analyst")) return "📊";
    if (name.includes("marketing consultant") || name.includes("marketing")) return "📣";
    if (name.includes("pr specialist") || name.includes("public relations")) return "📢";
    if (name.includes("event marketer")) return "📣";
    if (name.includes("telemarketer")) return "📞";
    if (name.includes("lead generator") || name.includes("lead gen")) return "🎯";
    if (name.includes("sales consultant") || name.includes("sales rep")) return "💰";
    if (name.includes("operations")) return "⚙️";
    if (name.includes("logistics")) return "🗺️";
    if (name.includes("supply chain")) return "⛓️";
    if (name.includes("inventory")) return "📦";
    if (name.includes("quality assurance") || name.includes("qa")) return "🧪";
    if (name.includes("transcriptionist") || name.includes("transcription")) return "🎧";
    if (name.includes("interpreter") || name.includes("interpretation")) return "🗣️";
    if (name.includes("call center")) return "📞";

    // Pet Services
    if (name.includes("dog walker") || name.includes("dog walking")) return "🐕";
    if (name.includes("pet sitter") || name.includes("pet sitting")) return "🐈";
    if (name.includes("pet groomer") || name.includes("pet grooming")) return "🧼";
    if (name.includes("dog trainer") || name.includes("dog training")) return "🐕";
    if (name.includes("aquarium")) return "🐠";
    if (name.includes("mobile vet") || name.includes("veterinarian")) return "🩺";
    if (name.includes("pet photographer")) return "🐾";
    if (name.includes("animal behaviorist")) return "🧠";
    if (name.includes("pet waste")) return "💩";
    if (name.includes("pet taxi")) return "🚕";
    if (name.includes("equine")) return "🐴";
    if (name.includes("farrier")) return "🐴";
    if (name.includes("reptile")) return "🦎";
    if (name.includes("bird")) return "🦜";
    if (name.includes("pet bakery")) return "🧁";
    if (name.includes("pet boarding")) return "🏠";

    // Arts, Crafts & Custom Made
    if (name.includes("tailor") || name.includes("seamstress")) return "🧵";
    if (name.includes("furniture builder")) return "🪑";
    if (name.includes("jewelry") || name.includes("jeweller")) return "💍";
    if (name.includes("blacksmith")) return "⚒️";
    if (name.includes("welder") || name.includes("welding")) return "🧑‍🏭";
    if (name.includes("potter")) return "🏺";
    if (name.includes("ceramicist") || name.includes("ceramics")) return "🏺";
    if (name.includes("glassblower") || name.includes("glassblowing")) return "🔥";
    if (name.includes("woodworker") || name.includes("woodworking")) return "🪓";
    if (name.includes("leatherworker") || name.includes("leather craft")) return "🎒";
    if (name.includes("cobbler") || name.includes("shoe repair")) return "👞";

    // Generic defaults based on keyword matches
    if (name.includes("clean")) return "🧼";
    if (name.includes("food") || name.includes("drink") || name.includes("cater") || name.includes("chef") || name.includes("cook")) return "🧑‍🍳";
    if (name.includes("car") || name.includes("auto") || name.includes("vehicle") || name.includes("drive") || name.includes("towing")) return "🚗";
    if (name.includes("design") || name.includes("art") || name.includes("paint") || name.includes("creative")) return "🎨";
    if (name.includes("write") || name.includes("edit") || name.includes("content")) return "✍️";
    if (name.includes("computer") || name.includes("tech") || name.includes("software") || name.includes("web") || name.includes("code")) return "💻";
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("animal")) return "🐕";
    if (name.includes("build") || name.includes("construct") || name.includes("repair") || name.includes("install") || name.includes("maintenance")) return "🛠️";
    if (name.includes("teach") || name.includes("tutor") || name.includes("learn") || name.includes("school") || name.includes("coach")) return "📚";
    if (name.includes("deliver") || name.includes("move") || name.includes("package") || name.includes("courier")) return "📦";

    // Default Fallback
    return "📦";
};

export const resolveCategoryEmoji = (icon?: string, name?: string): string => {
    const iconStr = icon ? icon.trim() : "";
    if (iconStr && !/[a-zA-Z0-9]/.test(iconStr)) {
        return iconStr;
    }
    return getCategoryEmoji(name || "");
};
