import { Colors } from '@/constants/Colors';
import React, {
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import CustomBottomSheet, { BottomSheetHandle } from '@/components/modals/BottomSheet';

interface SearchModalProps {
  onDismiss?: () => void;
}

const mockSuggestions = [
  'How to improve focus',
  'Create a new task',
  'Budget tips 2025',
  'Plan my goals',
  'AI suggestions for finance',
  'Quick expenses list',
];

function SearchModalComponent({ onDismiss }: SearchModalProps, ref: ForwardedRef<BottomSheetHandle>) {
  const internalRef = useRef<BottomSheetHandle>(null);
  const [query, setQuery] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      present: () => internalRef.current?.present(),
      dismiss: () => internalRef.current?.dismiss(),
    }),
    []
  );

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return mockSuggestions.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleClose = useCallback(() => {
    internalRef.current?.dismiss();
    onDismiss?.();
  }, [onDismiss]);

  const handleSelect = useCallback(
    (item: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Selected:', item);
      handleClose();
    },
    [handleClose]
  );

  return (
    <CustomBottomSheet
      ref={internalRef}
      onDismiss={onDismiss}
      contentContainerStyle={styles.sheetContent}
      isFullScreen
    >
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={22} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search..."
            placeholderTextColor={Colors.textSecondary + '99'}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.resultsWrapper}>
        {filteredResults.length > 0 ? (
          <BottomSheetFlatList
            data={filteredResults}
            keyExtractor={(item: any) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }: { item: any }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [styles.resultItem, pressed && { opacity: 0.6 }]}
              >
                <Ionicons
                  name='document-text-outline'
                  size={20}
                  color={Colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.resultText}>{item}</Text>
              </Pressable>
            )}
          />
        ) : query.length > 1 ? (
          <Text style={styles.noResults}>No results found</Text>
        ) : (
          <Text style={styles.hintText}>Start typing to see search results</Text>
        )}
      </View>
    </CustomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 6,
  },
  resultsWrapper: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomColor: Colors.textSecondary + '22',
    borderBottomWidth: 1,
  },
  resultText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  noResults: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 20,
    fontSize: 15,
  },
  hintText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 20,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default React.forwardRef<BottomSheetHandle, SearchModalProps>(SearchModalComponent);
