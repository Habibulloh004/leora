import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DateTransferIcon, DiagramIcon, DollorEuroIcon, SearchDocIcon, SettingIcon } from '@assets/icons';

interface FinanceHeaderProps {
  onTransferPress?: () => void;
  onSearchPress?: () => void;
  onSettingsPress?: () => void;
  onDiagramPress?: () => void;
  onCurrencyPress?: () => void;
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({
  onTransferPress,
  onSearchPress,
  onSettingsPress,
  onDiagramPress,
  onCurrencyPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onCurrencyPress}>
          <DollorEuroIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onDiagramPress}>
          <DiagramIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerTitle}>
        <Text style={styles.headerTitleText}>FINANCE</Text>
      </View>
      <View style={[styles.headerActions, styles.headerActionsRight]}>
        <TouchableOpacity style={styles.headerButton} onPress={onTransferPress}>
          <DateTransferIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
          <SearchDocIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onSettingsPress}>
          <SettingIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FinanceHeader;

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#25252B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionsRight: {
    justifyContent: 'flex-end',
  },
  headerButton: {
    padding: 4,
    borderRadius: 12,
  },
  headerTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A6A6B9',
    letterSpacing: 2,
  },
});
