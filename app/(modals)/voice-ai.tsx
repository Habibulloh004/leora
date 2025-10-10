import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  View
} from 'react-native';

export default function VoiceAiModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(false);
    router.back()
  };

  return (
    <React.Fragment>
      <View >
        <Text>
          This is a blank example modal. You can put your own content here.
        </Text>
      </View>
    </React.Fragment>
  );
}

