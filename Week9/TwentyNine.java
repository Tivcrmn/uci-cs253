import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.Map.Entry;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

class TwentyNine {
    private static ConcurrentLinkedQueue<String> word_space = new ConcurrentLinkedQueue<>();
    
    private static ConcurrentLinkedQueue<Map<String, Integer>> freq_space = new ConcurrentLinkedQueue<>();
    
    private static Set<String> stopWords = new HashSet<>();
    
    private static Map<String, Integer> word_freqs_final = new HashMap<>();
    
    static class Worker extends Thread {
    	public void run() {
    		process_words();
    	}
    }
    
    static class Freq extends Thread {
        private int lo;
        private int hi;
        
        public Freq(int l, int h) {
            lo = l;
            hi = h;
        }
        
        public void run() {
    		merge_words(lo, hi);
    	}
    }
    
    static private void process_words() {
        Map<String, Integer> word_freqs = new HashMap<>();
        while (true) {
            String word = word_space.poll();
            if (word == null) break;
            if (!stopWords.contains(word)) {
                word_freqs.put(word, word_freqs.getOrDefault(word, 0) + 1);
            }           
        }
        freq_space.add(word_freqs);
    }
    
    static private void readStopWords() throws IOException {
        String[] words = new String(Files.readAllBytes(Paths.get("../stop_words.txt"))).split(",");
    	for (String w : words) stopWords.add(w);
    }
    
    static private void readMainFile(String path) throws IOException {
        String data = new String(Files.readAllBytes(Paths.get(path))).toLowerCase();
    	data = Pattern.compile("[^a-zA-Z]").matcher(data).replaceAll(" ");
    	for (String word : data.split(" ")) {
    	    if (word.length() > 1) {
    	        word_space.add(word);
    	    }
    	}
    }
    
    static private void merge_words(int lo, int hi) {
        for (Map<String, Integer> m : freq_space) {
            for (String key : m.keySet()) {
                if (key.length() < lo || key.length() > hi) continue;
                word_freqs_final.put(key, word_freqs_final.getOrDefault(key, 0) + m.get(key));
            }
        }
    }
    
    static private void print() {
        List<Entry<String, Integer>> sorted = new ArrayList<Entry<String, Integer>>();
    	sorted.addAll(word_freqs_final.entrySet());    
    	Collections.sort(sorted, (w1, w2) -> w2.getValue() - w1.getValue());
    	for (int i = 0; i < 25; i++) {
    	   Entry<String, Integer> p = sorted.get(i);
    	   System.out.println(p.getKey() + " - " + p.getValue());
    	}
    }
    
    public static void main(String[] args) {
        
        try {
            readStopWords();
            readMainFile(args[0]);
        } catch(IOException e) {
            e.printStackTrace();
        }
        
        Worker[] workers = new Worker[5];
        
        for (int i = 0; i < workers.length; i++) {
            workers[i] = new Worker();
            workers[i].start();
        }
        
        for (int i = 0; i < workers.length; i++) {
            try {
                workers[i].join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        
        Freq[] freqs = new Freq[5];
        
        // use the length of word to divide the job in different threads
        freqs[0] = new Freq(2, 5);
        freqs[1] = new Freq(6, 8);
        freqs[2] = new Freq(9, 13);
        freqs[3] = new Freq(14, 18);
        freqs[4] = new Freq(19, 30);
        
        for (int i = 0; i < freqs.length; i++) {
            freqs[i].start();
        }
        
        for (int i = 0; i < freqs.length; i++) {
            try {
                freqs[i].join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        
        print();
    }
}