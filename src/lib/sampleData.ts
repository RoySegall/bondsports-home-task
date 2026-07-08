import { isVideoPath } from '../../shared/types'

// TEMP stand-in paths until CSV import is wired; includes non-video entries to
// exercise the "silently ignore non-video" rule.
const RAW_SAMPLE_PATHS = [
  'C:/Users/roy/Videos/Project_Demo_Final_v3.mp4',
  'C:/Users/roy/Videos/Holiday_Trip_Highlights.mkv',
  'C:/Users/roy/Videos/Cinematic_B_Roll_Pack.mov',
  'C:/Users/roy/Videos/UI_Interaction_Capture.webm',
  'C:/Users/roy/Videos/Client_Presentation_2026.avi',
  'C:/Users/roy/Videos/Live_Performance_Set.mp4',
  'C:/Users/roy/Videos/Drone_Coastline_4K.mov',
  'C:/Users/roy/Videos/Product_Teaser_Cut.mp4',
  'C:/Users/roy/Videos/Interview_Raw_Footage.mkv',
  'C:/Users/roy/Videos/Gameplay_Capture_Ranked.mp4',
  'C:/Users/roy/Videos/Timelapse_City_Night.webm',
  'C:/Users/roy/Videos/Wedding_Ceremony_Master.mov',
  'C:/Users/roy/Documents/budget_notes.txt', // ignored: not a video
  'C:/Users/roy/Pictures/screenshot_042.png', // ignored: not a video
]

/** The sample paths, already filtered to videos only (mirrors real import). */
export const SAMPLE_FILE_PATHS: string[] = RAW_SAMPLE_PATHS.filter(isVideoPath)
