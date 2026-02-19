
import Plunk from "@plunk/node";

const plunkApiKey = process.env.PLUNK_API_KEY;

export const plunk = plunkApiKey ? new Plunk(plunkApiKey) : null;
