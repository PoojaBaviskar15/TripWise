import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uudxfceikduzsjgmhuaj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZHhmY2Vpa2R1enNqZ21odWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTc0NzMsImV4cCI6MjA1Nzc5MzQ3M30.PwZWCr1pyQXkPxXB6zQYcJt_pZEWo2T0YsD1BjCqpkY";

export const supabase = createClient(supabaseUrl, supabaseKey);