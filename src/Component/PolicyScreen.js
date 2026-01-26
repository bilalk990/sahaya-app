import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { GET } from '../Backend/Backend';
import { POLICY } from '../Backend/api_routes';
import HeaderForUser from './HeaderForUser';
import { Font } from '../Constants/Font';
import { ImageConstant } from '../Constants/ImageConstant';

const { height } = Dimensions.get('window');

const PolicyScreen = ({ route, navigation }) => {
  const { slug } = route.params || {};
  const [pageContent, setPageContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    handlePolicy();
  }, []);

  const formattedSlug = slug
    ? slug.charAt(0).toUpperCase() + slug.slice(1)
    : '';
  const handlePolicy = () => {
    GET(
      POLICY,
      response => {
        setIsLoading(false);
        if (response?.success && Array.isArray(response?.data)) {
          const page = response.data.find(item => item.slug === slug);
          if (page) {
            setPageContent(page.body);
            setPageTitle(page.page_name || 'Policy');
          } else {
            setPageContent('<h3>No content found for this page.</h3>');
          }
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          setPageContent('<h3>Unable to fetch policy content.</h3>');
        }
      },
      error => {
        setIsLoading(false);
        setPageContent('<h3>Error loading content.</h3>');
      },
    );
  };

  return (
    <View style={styles.container}>
      <HeaderForUser
        title={formattedSlug}
        style_title={{ fontFamily: Font?.Manrope_SemiBold }}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
        containerStyle={{ paddingHorizontal: 20 }}
      />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D98579" />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <WebView
            originWhitelist={['*']}
            style={styles.webview}
            source={{
              html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                      padding: 20px;
                      font-size: 16px;
                      line-height: 26px;
                      color: #333;
                      background-color: #fafafa;
                      font-family: 'Helvetica Neue', Arial, sans-serif;
                    }
                    h1, h2, h3 {
                      color: #000000;
                      text-align: center;
                      margin-bottom: 10px;
                    }
                    p {
                      margin-bottom: 14px;
                    }
                    a {
                      color: #03a4ed;
                      text-decoration: none;
                    }
                    a:hover {
                      text-decoration: underline;
                    }
                  </style>
                </head>
                <body>${pageContent}</body>
              </html>
              `,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  webview: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  loaderContainer: {
    flex: 1,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default PolicyScreen;
