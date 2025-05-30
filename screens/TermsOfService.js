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

const TermsOfServiceScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isShortDevice && styles.contentShort]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 30, 2025</Text>

        <Section title="1. Acceptance of Terms">
          <Paragraph>
            By downloading, accessing, or using the Petsy mobile application ("App," "Service," or "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </Paragraph>
          <Paragraph>
            These Terms constitute a legally binding agreement between you and Petsy ("we," "us," or "our").
          </Paragraph>
        </Section>

        <Section title="2. Description of Service">
          <Paragraph>
            Petsy is a mobile application designed to help pet owners manage their pets' care, health records, and connect with other pet enthusiasts. Our Service includes:
          </Paragraph>
          <BulletPoint>Pet profile management and photo sharing</BulletPoint>
          <BulletPoint>Health tracking and veterinary record keeping</BulletPoint>
          <BulletPoint>Community features and social interactions</BulletPoint>
          <BulletPoint>Reminders and scheduling tools</BulletPoint>
          <BulletPoint>Educational content and resources</BulletPoint>
        </Section>

        <Section title="3. User Accounts and Registration">
          <Paragraph>
            To use certain features of our Service, you must create an account. You agree to:
          </Paragraph>
          <BulletPoint>Provide accurate and complete information</BulletPoint>
          <BulletPoint>Maintain the security of your account credentials</BulletPoint>
          <BulletPoint>Accept responsibility for all activities under your account</BulletPoint>
          <BulletPoint>Notify us immediately of any unauthorized use</BulletPoint>
          <BulletPoint>Be at least 13 years old to create an account</BulletPoint>
        </Section>

        <Section title="4. Acceptable Use Policy">
          <Text style={styles.subsectionTitle}>4.1 Permitted Use</Text>
          <Paragraph>You may use our Service for lawful purposes only and in accordance with these Terms.</Paragraph>

          <Text style={styles.subsectionTitle}>4.2 Prohibited Activities</Text>
          <Paragraph>You agree NOT to:</Paragraph>
          <BulletPoint>Upload harmful, offensive, or inappropriate content</BulletPoint>
          <BulletPoint>Harass, threaten, or intimidate other users</BulletPoint>
          <BulletPoint>Violate any applicable laws or regulations</BulletPoint>
          <BulletPoint>Infringe on intellectual property rights</BulletPoint>
          <BulletPoint>Distribute malware or engage in hacking activities</BulletPoint>
          <BulletPoint>Create fake accounts or impersonate others</BulletPoint>
          <BulletPoint>Spam or send unsolicited communications</BulletPoint>
          <BulletPoint>Use the Service for commercial purposes without permission</BulletPoint>
        </Section>

        <Section title="5. User Content">
          <Paragraph>
            You retain ownership of content you submit to our Service ("User Content"). By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Service.
          </Paragraph>
          <Paragraph>
            You represent that your User Content does not violate any third-party rights and complies with these Terms.
          </Paragraph>
        </Section>

        <Section title="6. Privacy and Data Protection">
          <Paragraph>
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, you consent to our Privacy Policy.
          </Paragraph>
        </Section>

        <Section title="7. Veterinary Disclaimer">
          <Paragraph>
            <Text style={styles.importantText}>IMPORTANT: </Text>
            Petsy is not a substitute for professional veterinary care. Our Service provides general information and tools for pet care management, but does not provide medical advice, diagnosis, or treatment.
          </Paragraph>
          <BulletPoint>Always consult with a qualified veterinarian for medical concerns</BulletPoint>
          <BulletPoint>In case of emergency, contact your veterinarian immediately</BulletPoint>
          <BulletPoint>We are not liable for any health issues arising from use of our Service</BulletPoint>
        </Section>

        <Section title="8. Intellectual Property">
          <Paragraph>
            The Service, including its design, features, and content (excluding User Content), is owned by Petsy and protected by copyright, trademark, and other intellectual property laws.
          </Paragraph>
          <Paragraph>
            You may not copy, modify, distribute, or create derivative works of our Service without explicit permission.
          </Paragraph>
        </Section>

        <Section title="9. Service Availability">
          <Paragraph>
            We strive to maintain continuous service availability but cannot guarantee uninterrupted access. We may:
          </Paragraph>
          <BulletPoint>Temporarily suspend the Service for maintenance</BulletPoint>
          <BulletPoint>Modify or discontinue features with notice</BulletPoint>
          <BulletPoint>Limit usage to ensure fair access for all users</BulletPoint>
        </Section>

        <Section title="10. Account Termination">
          <Paragraph>
            Either party may terminate your account at any time. We may suspend or terminate your account if you violate these Terms. Upon termination:
          </Paragraph>
          <BulletPoint>Your access to the Service will cease immediately</BulletPoint>
          <BulletPoint>Your User Content may be deleted</BulletPoint>
          <BulletPoint>These Terms will remain in effect for applicable provisions</BulletPoint>
        </Section>

        <Section title="11. Disclaimers and Limitation of Liability">
          <Text style={styles.subsectionTitle}>11.1 Service Disclaimer</Text>
          <Paragraph>
            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
          </Paragraph>

          <Text style={styles.subsectionTitle}>11.2 Limitation of Liability</Text>
          <Paragraph>
            To the maximum extent permitted by law, Petsy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </Paragraph>
        </Section>

        <Section title="12. Indemnification">
          <Paragraph>
            You agree to indemnify and hold harmless Petsy from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
          </Paragraph>
        </Section>

        <Section title="13. Governing Law">
          <Paragraph>
            These Terms are governed by and construed in accordance with applicable laws. Any disputes will be resolved through binding arbitration or in courts of competent jurisdiction.
          </Paragraph>
        </Section>

        <Section title="14. Changes to Terms">
          <Paragraph>
            We reserve the right to modify these Terms at any time. We will notify users of material changes through the App or via email. Continued use of the Service after changes constitutes acceptance of the updated Terms.
          </Paragraph>
        </Section>

        <Section title="15. Severability">
          <Paragraph>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
          </Paragraph>
        </Section>

        <Section title="16. Contact Information">
          <Paragraph>
            If you have questions about these Terms of Service, please contact us:
          </Paragraph>
          <Text style={styles.contactInfo}>Email: legal@petsy.app</Text>
          <Text style={styles.contactInfo}>Support: support@petsy.app</Text>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Petsy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
  importantText: {
    fontWeight: '600',
    color: '#FF3B30',
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

export default TermsOfServiceScreen;