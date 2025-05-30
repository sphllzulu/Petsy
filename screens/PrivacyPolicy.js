import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const isShortDevice = screenHeight < 700;

const PrivacyPolicyScreen = ({ navigation }) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

  const BulletPoint = ({ children }) => (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isShortDevice && styles.contentShort]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 30, 2025</Text>

        <Section title="1. Introduction">
          <Paragraph>
            Welcome to Petsy ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (the "Service").
          </Paragraph>
          <Paragraph>
            We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This policy outlines our practices concerning your personal information.
          </Paragraph>
        </Section>

        <Section title="2. Information We Collect">
          <Text style={styles.subsectionTitle}>2.1 Personal Information</Text>
          <Paragraph>We may collect the following personal information:</Paragraph>
          <BulletPoint>Name and display name</BulletPoint>
          <BulletPoint>Email address</BulletPoint>
          <BulletPoint>Profile information</BulletPoint>
          <BulletPoint>Pet information and photos</BulletPoint>
          <BulletPoint>Location data (with your permission)</BulletPoint>

          <Text style={styles.subsectionTitle}>2.2 Usage Information</Text>
          <Paragraph>We automatically collect information about how you use our Service:</Paragraph>
          <BulletPoint>App usage patterns and preferences</BulletPoint>
          <BulletPoint>Device information (device type, operating system)</BulletPoint>
          <BulletPoint>Log files and analytics data</BulletPoint>
          <BulletPoint>Crash reports and performance data</BulletPoint>
        </Section>

        <Section title="3. How We Use Your Information">
          <Paragraph>We use your information to:</Paragraph>
          <BulletPoint>Provide and maintain our Service</BulletPoint>
          <BulletPoint>Personalize your experience</BulletPoint>
          <BulletPoint>Send you important updates and notifications</BulletPoint>
          <BulletPoint>Improve our app and develop new features</BulletPoint>
          <BulletPoint>Ensure security and prevent fraud</BulletPoint>
          <BulletPoint>Comply with legal obligations</BulletPoint>
          <BulletPoint>Provide customer support</BulletPoint>
        </Section>

        <Section title="4. Information Sharing">
          <Paragraph>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Paragraph>
          <BulletPoint>With your explicit consent</BulletPoint>
          <BulletPoint>To comply with legal obligations</BulletPoint>
          <BulletPoint>To protect our rights, property, or safety</BulletPoint>
          <BulletPoint>With trusted service providers who assist us in operating our Service</BulletPoint>
          <BulletPoint>In case of business transfer or merger</BulletPoint>
        </Section>

        <Section title="5. Data Security">
          <Paragraph>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </Paragraph>
          <BulletPoint>Encryption of data in transit and at rest</BulletPoint>
          <BulletPoint>Regular security assessments</BulletPoint>
          <BulletPoint>Access controls and authentication</BulletPoint>
          <BulletPoint>Secure data storage with Firebase</BulletPoint>
        </Section>

        <Section title="6. Your Rights">
          <Paragraph>You have the right to:</Paragraph>
          <BulletPoint>Access your personal information</BulletPoint>
          <BulletPoint>Correct inaccurate information</BulletPoint>
          <BulletPoint>Delete your account and personal data</BulletPoint>
          <BulletPoint>Opt-out of marketing communications</BulletPoint>
          <BulletPoint>Data portability (where applicable)</BulletPoint>
          <BulletPoint>Lodge complaints with relevant authorities</BulletPoint>
        </Section>

        <Section title="7. Data Retention">
          <Paragraph>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When you delete your account, we will delete your personal information within 30 days.
          </Paragraph>
        </Section>

        <Section title="8. Children's Privacy">
          <Paragraph>
            Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </Paragraph>
        </Section>

        <Section title="9. International Data Transfers">
          <Paragraph>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
          </Paragraph>
        </Section>

        <Section title="10. Third-Party Services">
          <Paragraph>
            Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </Paragraph>
        </Section>

        <Section title="11. Updates to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </Paragraph>
        </Section>

        <Section title="12. Contact Us">
          <Paragraph>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Paragraph>
          <Text style={styles.contactInfo}>Email: privacy@petsy.app</Text>
          <Text style={styles.contactInfo}>Support: support@petsy.app</Text>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Petsy, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: isShortDevice ? 12 : 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  contentShort: {
    padding: 12,
    paddingBottom: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: isShortDevice ? 16 : 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: isShortDevice ? 16 : 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: isShortDevice ? 8 : 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: isShortDevice ? 8 : 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: isShortDevice ? 20 : 22,
    color: '#333',
    marginBottom: isShortDevice ? 8 : 10,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    lineHeight: isShortDevice ? 20 : 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: isShortDevice ? 20 : 22,
    color: '#333',
  },
  contactInfo: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    marginTop: isShortDevice ? 16 : 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;