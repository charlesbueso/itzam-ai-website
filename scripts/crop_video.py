import subprocess
import json
import os
import sys

INPUT_PATH = r"B:\Itzam.ai\Website\landing-bg-desktop.mp4"
OUTPUT_PATH = r"B:\Itzam.ai\Website\landing-bg-desktop-web.mp4"

CROP_FRACTION = 0.20  # 25vh = 25% of video height from top and bottom


def get_video_info(path):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    streams = json.loads(result.stdout)["streams"]
    video = next(s for s in streams if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in streams)
    return int(video["width"]), int(video["height"]), has_audio


def main():
    if not os.path.exists(INPUT_PATH):
        print(f"Error: input file not found: {INPUT_PATH}")
        sys.exit(1)

    width, height, has_audio = get_video_info(INPUT_PATH)

    crop_y = int(height * CROP_FRACTION)
    new_height = height - crop_y * 2

    # Codec requires even dimensions
    if new_height % 2 != 0:
        new_height -= 1

    crop_filter = f"crop={width}:{new_height}:0:{crop_y}"

    print(f"Input:  {width}x{height}")
    print(f"Crop:   {crop_y}px from top, {crop_y}px from bottom")
    print(f"Output: {width}x{new_height}")
    print()

    cmd = [
        "ffmpeg",
        "-i", INPUT_PATH,
        "-vf", crop_filter,
        # Video: H.264, good quality, broad compatibility
        "-c:v", "libx264",
        "-crf", "23",           # 18–28; lower = better quality
        "-preset", "slow",      # Better compression at slight CPU cost
        "-profile:v", "high",
        "-level", "4.1",
        "-pix_fmt", "yuv420p",  # Required for Safari / older browsers
        # Web: move moov atom to the front so playback starts immediately
        "-movflags", "+faststart",
    ]

    if has_audio:
        cmd += ["-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]

    cmd += ["-y", OUTPUT_PATH]

    subprocess.run(cmd, check=True)
    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"\nDone! Saved to: {OUTPUT_PATH}  ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
