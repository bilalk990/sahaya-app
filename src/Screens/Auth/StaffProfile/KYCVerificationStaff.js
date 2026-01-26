import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import UploadBox from '../../../Component/UploadBox';
import { ImageConstant } from '../../../Constants/ImageConstant';
import { Font } from '../../../Constants/Font';
import Typography from '../../../Component/UI/Typography';
import { POST_FORM_DATA } from '../../../Backend/Backend';
import { KYC_UPLOAD } from '../../../Backend/api_routes';
import ImageModal from '../../../Component/Modals/ImageModal';
import { isValidForm } from '../../../Backend/Utility';
import LocalizedStrings from '../../../Constants/localization';
import { validators } from '../../../Backend/Validator';
import SimpleToast from 'react-native-simple-toast';

const KYCVerificationStaff = forwardRef(({ userDetail }, ref) => {
  const [uploadedImages, setUploadedImages] = useState({
    police_verification: null,
    aadhaar_front: null,
    aadhaar_back: null,
  });

  useEffect(() => {
    if (userDetail?.kyc_information) {
      const kycInfo = userDetail.kyc_information;

      // Helper function to check if path is valid
      const isValidPath = path => {
        return (
          path &&
          typeof path === 'string' &&
          path.trim().length > 0 &&
          path !== 'null' &&
          path !== 'undefined'
        );
      };

      setUploadedImages({
        police_verification: isValidPath(kycInfo?.police_verification_path)
          ? { uri: kycInfo.police_verification_path }
          : null,
        aadhaar_front: isValidPath(kycInfo?.aadhaar_front_path)
          ? { uri: kycInfo.aadhaar_front_path }
          : null,
        aadhaar_back: isValidPath(kycInfo?.aadhaar_back_path)
          ? { uri: kycInfo.aadhaar_back_path }
          : null,
      });
    }
  }, [userDetail]);

  const [currentImageType, setCurrentImageType] = useState('');

  const [showImageModal, setShowImageModal] = useState(false);

  const [errors, setErrors] = useState({});

  // Function to set image
  const setImageData = (imageType, imageData) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageType]: imageData,
    }));
    // Clear error when image is uploaded
    if (errors[imageType]) {
      setErrors(prev => ({
        ...prev,
        [imageType]: null,
      }));
    }
  };

  // Handle image selection from modal
  const handleImageSelected = images => {
    if (images && images.length > 0) {
      const selectedImage = images[0];
      const imageObj = {
        uri: selectedImage?.path || selectedImage?.uri,
        path: selectedImage?.path,
        name: selectedImage?.filename || `${currentImageType}.jpg`,
        type: selectedImage?.mime || 'image/jpeg',
      };

      // Store the image data
      setImageData(currentImageType, imageObj);

      // Clear error for this field
      setErrors(prev => ({
        ...prev,
        [currentImageType]: null,
      }));
    }
    setShowImageModal(false);
  };

  // Handle image selection
  const handleImageSelection = imageType => {
    setCurrentImageType(imageType);
    setShowImageModal(true);
  };

  const renderImagePreview = imageType => {
    const image = uploadedImages[imageType];

    if (image) {
      // Handle different image data formats
      const imageUri = image.uri || image.path || image.source?.uri;

      // Check if URI is valid (not empty, null, or undefined)
      if (
        imageUri &&
        typeof imageUri === 'string' &&
        imageUri.trim().length > 0 &&
        imageUri !== 'null' &&
        imageUri !== 'undefined'
      ) {
        return (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                setImageData(imageType, null);
                // Clear error when image is removed (error will show again on validation)
                if (errors[imageType]) {
                  setErrors(prev => ({
                    ...prev,
                    [imageType]: null,
                  }));
                }
              }}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
    return null;
  };

  const saveKYC = () => {
    // Check if image exists (has uri or path)
    const hasImage = img => {
      if (!img) return false;
      const uri = img.uri || img.path;
      return (
        uri &&
        typeof uri === 'string' &&
        uri.trim().length > 0 &&
        uri !== 'null' &&
        uri !== 'undefined'
      );
    };

    // Validate all required images using validators
    const validationErrors = {
      // police_verification: validators.checkRequire(
      //   LocalizedStrings.NewStaffForm?.Police_Clearance_Certificate || 'Police Verification',
      //   hasImage(uploadedImages.police_verification) ? uploadedImages.police_verification : null
      // ),
      aadhaar_front: validators.checkRequire(
        LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details + ' Front' ||
          'Aadhaar Front',
        hasImage(uploadedImages.aadhaar_front)
          ? uploadedImages.aadhaar_front
          : null,
      ),
      aadhaar_back: validators.checkRequire(
        LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details + ' Back' ||
          'Aadhaar Back',
        hasImage(uploadedImages.aadhaar_back)
          ? uploadedImages.aadhaar_back
          : null,
      ),
    };

    setErrors(validationErrors);

    if (!isValidForm(validationErrors)) {
      SimpleToast.show(
        'Please upload all required documents',
        SimpleToast.SHORT,
      );
      return Promise.reject(new Error('Validation failed'));
    }

    // Check if any images have been changed (have 'path' property which means user uploaded a new one)
    const changedImages = [];
    Object.keys(uploadedImages).forEach(key => {
      const image = uploadedImages[key];
      if (image && image.path) {
        // This is a new upload with path
        changedImages.push(key);
      }
    });

    // If no images were changed, don't hit the API, just resolve
    if (changedImages.length === 0) {
      return Promise.resolve({ message: 'No changes detected' });
    }

    // Only send changed images
    const formData = new FormData();
    changedImages.forEach(key => {
      const image = uploadedImages[key];
      formData.append(key, {
        uri: image.path,
        name: image.name || `${key}.jpg`,
        type: image.type || 'image/jpeg',
      });
    });

    return new Promise((resolve, reject) => {
      POST_FORM_DATA(
        KYC_UPLOAD,
        formData,
        success => {
          resolve(success);
          Profile();
        },
        error => {
          reject(error);
        },
        fail => {
          reject(fail);
        },
      );
    });
  };

  useImperativeHandle(ref, () => ({
    saveKYC: saveKYC,
    isValid: () => {
      const hasImage = img => {
        if (!img) return false;
        const uri = img.uri || img.path;
        return (
          uri &&
          typeof uri === 'string' &&
          uri.trim().length > 0 &&
          uri !== 'null' &&
          uri !== 'undefined'
        );
      };
      return isValidForm({
        police_verification: validators.checkRequire(
          'Police Verification',
          hasImage(uploadedImages.police_verification)
            ? uploadedImages.police_verification
            : null,
        ),
        aadhaar_front: validators.checkRequire(
          'Aadhaar Front',
          hasImage(uploadedImages.aadhaar_front)
            ? uploadedImages.aadhaar_front
            : null,
        ),
        aadhaar_back: validators.checkRequire(
          'Aadhaar Back',
          hasImage(uploadedImages.aadhaar_back)
            ? uploadedImages.aadhaar_back
            : null,
        ),
      });
    },
  }));

  return (
    <>
      <View style={styles.wrap}>
        <Typography style={styles.heading}>
          {LocalizedStrings.StaffProfile?.KYC_Status || 'KYC & Verification'}
        </Typography>

        <View style={[styles.row, { justifyContent: 'center' }]}>
          <View style={[styles.uploadWrapper, { width: '48%' }]}>
            <UploadBox
              title={
                LocalizedStrings.NewStaffForm?.Police_Clearance_Certificate ||
                'Upload Police Verification Certificate'
              }
              icon={ImageConstant.Verify}
              onPress={() => handleImageSelection('police_verification')}
            />
            {errors.police_verification && (
              <Text style={styles.errorText}>{errors.police_verification}</Text>
            )}
            {renderImagePreview('police_verification')}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.uploadWrapper}>
            <UploadBox
              title={
                LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details +
                  ' Front' || 'Upload Aadhaar Front Image'
              }
              icon={ImageConstant.Doc}
              onPress={() => handleImageSelection('aadhaar_front')}
            />
            {errors.aadhaar_front && (
              <Text style={styles.errorText}>{errors.aadhaar_front}</Text>
            )}
            {renderImagePreview('aadhaar_front')}
          </View>
          <View style={styles.uploadWrapper}>
            <UploadBox
              title={
                LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details + ' Back' ||
                'Upload Aadhaar Back Image'
              }
              icon={ImageConstant.Doc}
              onPress={() => handleImageSelection('aadhaar_back')}
            />
            {errors.aadhaar_back && (
              <Text style={styles.errorText}>{errors.aadhaar_back}</Text>
            )}
            {renderImagePreview('aadhaar_back')}
          </View>
        </View>
      </View>

      <ImageModal
        showModal={showImageModal}
        title={
          LocalizedStrings.EditProfile?.upload_document || 'Upload Document'
        }
        close={() => setShowImageModal(false)}
        selected={handleImageSelected}
      />
    </>
  );
});

export default KYCVerificationStaff;

const styles = StyleSheet.create({
  heading: {
    fontFamily: Font?.Manrope_Bold,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10,
  },
  wrap: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  uploadWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
