import cv2
import numpy as np
import directory_manager as dm

FACE_DATUM_WIDTH=60
FACE_DATUM_HEIGHT=70

def ascii_prep(filename):
    width = FACE_DATUM_WIDTH
    height = FACE_DATUM_HEIGHT

    with open(filename, 'r') as file:
        lines = file.readlines()

    all_images = []
    for i in range(0, len(lines), height):
        image_lines = lines[i:i + height]
        image_pixels = []

        for line in image_lines:
            line = line.rstrip('\n')
            # Ensure each line has exactly the right number of characters
            line = line.ljust(width, ' ')
            line_pixels = [0 if char == ' ' else 1 for char in line[:width]]
            image_pixels.extend(line_pixels)

        # Check if the image is correctly sized, if not log an error or fix
        if len(image_pixels) != width * height:
            print(f"Error: Image at lines {i}-{i+height} is not the correct size.")
        all_images.append(image_pixels)

    return np.array(all_images)

def image_prep(filename): # This function is only for formatting photos with supported file extensions for our Neural network
    file = dm.find_file(filename)
    if file.endswith(".jpg") or file.endswith(".png"):
        image = cv2.imread(file, cv2.COLOR_BGR2HSV)

        if(image.shape[0] != FACE_DATUM_HEIGHT and image.shape[0] != FACE_DATUM_HEIGHT):
            w_ratio = FACE_DATUM_WIDTH/image.shape[1]
            h_ratio = FACE_DATUM_HEIGHT/image.shape[0]
            new_image = cv2.resize(image, (0, 0), fx=w_ratio, fy=h_ratio)
            image = new_image
            # print(f"height: {image.shape[0]}")
            # print(f"width: {image.shape[1]}")
            
        H, S, V = cv2.split(image) # splitting the image to different types: Hue, Saturation, Value
        cv2.imshow("Grayscale Image", mat=(S)) # uncomment all to see the modified grayscale image
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        S = S.astype(np.uint16)
        S = np.array(S) # list to numpy matrix conversion 
        S= (S/255.0) # normalizing the numpy matrix grayscale values
        
        for i in range(S.shape[0]): # rounds out the values to 0 or 1 to let our Neural Network analyze it
            sub = S[i]
            for j in range(S.shape[1]):
                sub[j] = round(sub[j])
                if sub[j] == 0:
                    sub[j] = 1
                else:
                    sub[j] = 0
        # print(S) # shows rounded our list of 1s and 0s
        return S

# This function loads label data from the specified file to compare the predictions made by the model
# during training with the actual labeled data. By doing this the code will slowly make improvements to the weights
# and the biases to improve our NN.
def load_labels(file_path):
    with open(file_path, 'r') as file:
        labels = file.readlines()
    labels = [int(label.strip()) for label in labels]
    return np.array(labels)