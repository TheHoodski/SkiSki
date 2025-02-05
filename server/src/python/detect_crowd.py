from ultralytics import YOLO
import sys
import json

def detect_people(image_path):
    model = YOLO('yolov8x.pt')
    results = model(image_path, verbose=False, conf=0.25)
    
    people_detections = [box for box in results[0].boxes if box.cls == 0]
    people_count = len(people_detections)
    confidence = float(sum(box.conf for box in people_detections) / people_count) if people_count > 0 else 0.0
    
    return json.dumps({
        'count': people_count,
        'confidence': confidence
    })

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(1)
    print(detect_people(sys.argv[1]))